import os
import logging
from dotenv import load_dotenv
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import redis
import random
from deep_translator import GoogleTranslator  # Use deep-translator
from langdetect import detect
from app.utils.auth import get_current_active_user
from app.models.users import DBUser

# Configure logging for debug output
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables and verify
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
logger.debug(f"API Key loaded: {'Successfully loaded' if OPENROUTER_API_KEY else 'Failed to load'}")
logger.debug(f"API Key starts with: {OPENROUTER_API_KEY[:10] if OPENROUTER_API_KEY else 'None'}")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

from app.models.chatbot_llm import IntentRequest, IntentResponse, IntentClassifier
from app.utils.redis_client import get_chat_history, append_to_history
from app.database import get_db
from app.chatlog import ChatLog

router = APIRouter()
intent_model = IntentClassifier()

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if OPENROUTER_API_KEY:
    logger.info("OpenRouter API key loaded successfully")
else:
    logger.error("Failed to load OpenRouter API key")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

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

async def call_openrouter_api(messages, selected_model):
    logger.debug(f"Starting OpenRouter API call with key prefix: {OPENROUTER_API_KEY[:10]}...")
    if not OPENROUTER_API_KEY:
        logger.error("OpenRouter API key not found")
        raise ValueError("OpenRouter API key is required")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/AgriAI/AgriAI", 
        "X-Title": "AgriAI Chatbot"
    }
    logger.debug(f"Request headers: {headers}")
    payload = {
        "model": selected_model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }
    logger.debug(f"Making request to {OPENROUTER_URL} with model: {selected_model}")
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            logger.debug("Sending request to OpenRouter...")
            response = await client.post(
                OPENROUTER_URL,
                json=payload,
                headers=headers
            )
            logger.debug(f"Response status: {response.status_code}")
            logger.debug(f"Response headers: {response.headers}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            if e.response:
                logger.error(f"Response content: {e.response.text}")
                logger.error(f"Request headers sent: {e.response.request.headers}")
            raise

@router.post("/chat", response_model=IntentResponse)
async def chat_endpoint(
    request: IntentRequest,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    """
    Chat endpoint for AgriAI assistant.
    - Detects user intent via local model.
    - If fallback, calls OpenRouter LLM API.
    - Maintains chat context in Redis.
    - Supports multilingual, agriculture-only domain.
    """
    original_message = request.message
    session_id = request.session_id or current_user.email
    logger.info(f"Received message from {current_user.email}: {original_message}")

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
                context_messages = history[-10:] if history else []
            except redis.exceptions.ConnectionError:
                context_messages = [f"user: {original_message}"]

            # Prepare messages payload for OpenRouter
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
"""
                }
            ]

            # Append past context messages from Redis
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

            # Verify API key is loaded
            if not OPENROUTER_API_KEY:
                logger.error("OpenRouter API key not found in environment variables")
                return IntentResponse(
                    reply="Configuration error: API key not found. Please contact support.",
                    intent="error"
                )

            selected_model = random.choice(FREE_MODELS)
            logger.info(f"Using model: {selected_model}")

            try:
                data = await call_openrouter_api(messages, selected_model)
                reply = data["choices"][0]["message"]["content"]

            except httpx.HTTPStatusError as e:
                error_message = f"OpenRouter API error: {e.response.text if e.response else str(e)}"
                logger.error(error_message)

                if e.response and e.response.status_code == 429:
                    # Rate limit hit - try a different model
                    remaining_models = [m for m in FREE_MODELS if m != selected_model]
                    if remaining_models:
                        selected_model = random.choice(remaining_models)
                        logger.info(f"Rate limit hit, retrying with model: {selected_model}")
                        try:
                            data = await call_openrouter_api(messages, selected_model)
                            reply = data["choices"][0]["message"]["content"]
                        except Exception:
                            reply = "I apologize, but our AI service is currently at capacity. Please try again in a few minutes."
                    else:
                        reply = "I apologize, but our AI service is currently at capacity. Please try again in a few minutes."
                else:
                    reply = "I apologize, but I'm having trouble accessing our AI service. Please try again later."

            except (httpx.RequestError, httpx.TimeoutException) as e:
                logger.error(f"Network error with OpenRouter API: {str(e)}")
                reply = "I apologize, but I'm having trouble connecting to our AI service. Please try again later."

                # Add helpful default responses for common agricultural topics
                msg_lower = request.message.lower()
                if any(term in msg_lower for term in ["n:", "p:", "k:", "npk", "temperature", "humidity", "rainfall", "ph"]) or request.message.count(":") >= 3:
                    reply += " For crop recommendations, please share your soil NPK values, temperature, humidity, pH, and rainfall data. You can use the /predict-crop endpoint for precise recommendations. Based on the data you provided, you might want to try our crop prediction endpoint directly."
                elif "crop" in msg_lower or "plant" in msg_lower:
                    reply += " For crop recommendations, please share your soil NPK values, temperature, humidity, pH, and rainfall data. You can use the /predict-crop endpoint for precise recommendations."
                elif "disease" in msg_lower or "spot" in msg_lower or "sick" in msg_lower:
                    reply += " For plant disease detection, please upload a photo of the affected plant through our disease detection endpoint for accurate diagnosis."
                else:
                    reply += " Please try again later when our AI service is available again."

            except Exception as e:
                logger.error(f"Unexpected error during OpenRouter API call: {e}", exc_info=True)
                reply = "I apologize, but something went wrong processing your request."

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

@router.get("/test-env")
async def test_environment():
    logger.debug("Testing environment variables...")
    return {
        "api_key_present": bool(OPENROUTER_API_KEY),
        "api_key_length": len(OPENROUTER_API_KEY) if OPENROUTER_API_KEY else 0,
        "api_key_prefix": OPENROUTER_API_KEY[:10] + "..." if OPENROUTER_API_KEY else None,
        "environment": os.environ.get("ENV", "development")
    }
