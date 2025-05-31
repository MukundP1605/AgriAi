import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.chatbot_llm import IntentRequest, IntentResponse, IntentClassifier
from app.utils.redis_client import get_chat_history, append_to_history
from app.database import get_db
from app.chatlog import ChatLog
import redis
import logging
import random
from deep_translator import GoogleTranslator  # Use deep-translator
from langdetect import detect

router = APIRouter()
intent_model = IntentClassifier()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

logger = logging.getLogger(__name__)

FREE_MODELS = [
    "meta-llama/llama-3.3-8b-instruct:free",  # This one works   # This works but has rate limits
    "deepseek/deepseek-prover-v2:free",
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-chat-v3-0324:free"  # Another reliable option
    
]

def detect_language(text: str) -> str:
    try:
        return detect(text)
    except Exception:
        return "en"

@router.post("/chat", response_model=IntentResponse)
async def chat_endpoint(
    request: IntentRequest,
    db: Session = Depends(get_db)
):
    original_message = request.message
    session_id = request.session_id or "default_session"
    logger.info(f"Received message: {original_message}")

    # Save user message to Redis (context memory)
    try:
        append_to_history(session_id, f"user: {original_message}")
    except redis.exceptions.ConnectionError:
        logger.warning("⚠️ Redis connection failed: chat history not saved")

    try:
        # Step 1: Detect language (just detect, no translation yet)
        detected_lang = detect_language(original_message)
        logger.info(f"Detected language: {detected_lang}")

        # Step 2: Predict intent using local model
        intent, reply = intent_model.predict_intent(original_message)

        if intent == "fallback":
            # Step 3: fallback via LLM (OpenRouter API)

            # Fetch last 10 messages from Redis for context
            try:
                history = get_chat_history(session_id)
                context_messages = history[-10:]
            except redis.exceptions.ConnectionError:
                context_messages = [f"user: {original_message}"]            # Prepare messages payload for OpenRouter
            messages = [
    {
        "role": "system",
        "content": f"""
You are **AgriAI**, an intelligent, multilingual virtual assistant trained exclusively in agriculture.

🌐 **Language Policy**
- Detect and mirror the user's language. (Detected: {detected_lang})
- Maintain a friendly, respectful, and informative tone in every language.

🌾 **Your Domain of Expertise (Stay Strictly Within These)**
You are allowed to answer only agricultural topics:
- Crop recommendation and seasonal planning
- Soil nutrients, health improvement, and testing
- Fertilizers (organic, synthetic) and their schedules
- Irrigation techniques (drip, sprinkler, flood, etc.)
- Plant disease and pest identification
- Weather-related farming strategies
- Sustainable and modern agriculture methods
- Best practices for sowing, harvesting, crop rotation

❌ Never respond to non-agriculture questions. Politely guide the user back to farming topics.

🧠 **Response Style Guidelines**
- Keep responses factual, clear, and neatly formatted
- Use **headings**, **bullet points**, and **short paragraphs** where applicable
- Always provide **examples** and **practical advice**
- Do **not** hallucinate names of crops, fertilizers, or diseases — only use known, scientifically accurate data

🌿 **Crop Recommendation Handling**
When the user wants to know which crop to grow:
1. Collect the following details from them:
   - **N**, **P**, **K** values (soil nutrients)
   - **Temperature**, **Humidity**
   - **pH**, **Rainfall**
2. Once all values are available, send this data to the `/predict-crop` API
3. Wait for the model’s response
4. Then explain the result to the user with:
   - Recommended crop
   - Why it’s suitable (based on input)
   - Optional tips (e.g., planting time, care, yield)

🍂 **Disease Detection Handling**
If the user mentions:
- Yellowing leaves, brown spots, wilting, curling, fungus, pests
→ Guide them to upload an image via the `/predict-disease` endpoint

Also explain:
- “Image-based diagnosis uses machine learning for better accuracy than text-based guessing.”

🔐 **Safety Rules**
- Do NOT answer outside agriculture.
- Do NOT guess or fabricate responses.
- If unsure or lacking data, say:
  “I need more information to provide an accurate answer.”

---

You are designed to **assist, educate, and empower farmers** using science, data, and modern tools. Be accurate, be humble, and stay helpful.
"""    }
]

            for entry in context_messages:
                try:
                    role, content = entry.split(": ", 1)
                except ValueError:
                    role, content = "user", entry

                # Map Redis roles to OpenRouter roles
                mapped_role = "assistant" if role.strip() == "bot" else "user"
                messages.append({"role": mapped_role, "content": content})

            # Add current user message (no translation yet)
            messages.append({"role": "user", "content": original_message})

            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://agriai-app.com",  # Add this header to help with rate limits
                "X-Title": "AgriAI Farming Assistant"      # Add this header to identify your app
            }
            
            selected_model = random.choice(FREE_MODELS)
            logger.info(f"Using model: {selected_model}")
            
            payload = {
                "model": selected_model,  # Use the randomly selected model
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024  # Specify max tokens to control response length
            }

            logger.debug(f"Sending to OpenRouter: {payload}")

            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

                # If OpenRouter is unavailable, fall back to a helpful default response
                if response.status_code != 200:
                    error_message = f"OpenRouter API error: {response.text}"
                    logger.error(error_message)
                    
                    # Check if it's a rate limit error
                    if "rate limit" in response.text.lower() or "429" in response.text:
                        reply = f"I'm sorry, our AI service is currently at capacity. Here's what I can tell you based on your question:\n\n"
                        
                        # Add helpful default responses for common agricultural topics
                        if any(term in request.message.lower() for term in ["n:", "p:", "k:", "npk", "temperature", "humidity", "rainfall", "ph"]) or request.message.count(":") >= 3:
                            reply += "For crop recommendations, please share your soil NPK values, temperature, humidity, pH, and rainfall data. You can use the /predict-crop endpoint for precise recommendations. Based on the data you provided, you might want to try our crop prediction endpoint directly."
                        elif "crop" in request.message.lower() or "plant" in request.message.lower():
                            reply += "For crop recommendations, please share your soil NPK values, temperature, humidity, pH, and rainfall data. You can use the /predict-crop endpoint for precise recommendations."
                        elif "disease" in request.message.lower() or "spot" in request.message.lower() or "sick" in request.message.lower():
                            reply += "For plant disease detection, please upload a photo of the affected plant through our disease detection endpoint for accurate diagnosis."
                        else:
                            reply += "Please try again later when our AI service is available again."
                    else:
                        reply = "Sorry, our AI service is temporarily unavailable. Please try again later."
                else:
                    data = response.json()
                    reply = data["choices"][0]["message"]["content"]

                intent = "llama_fallback"

        # Save bot reply to Redis
        try:
            append_to_history(session_id, f"bot: {reply}")
        except redis.exceptions.ConnectionError:
            pass

        # Save chat log to DB
        db_log = ChatLog(
            session_id=session_id,
            user_message=original_message,
            bot_response=reply
        )
        db.add(db_log)
        db.commit()

        return IntentResponse(reply=reply, intent=intent)

    except Exception as e:
        logger.error(f"Chatbot error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Chatbot error occurred")
