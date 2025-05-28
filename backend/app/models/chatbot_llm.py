from pydantic import BaseModel
import json
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np
import re
from typing import Optional

class IntentRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"  # default session

class IntentResponse(BaseModel):
    intent: str
    reply: str

class IntentClassifier:
    def __init__(self, intents_path="app/models/intents.json"):
        with open(intents_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        self.data = data["intents"]

        # Prepare training data
        self.patterns = []
        self.labels = []

        for intent in self.data:
            for pattern in intent["patterns"]:
                self.patterns.append(pattern.lower())
                self.labels.append(intent["tag"])

        # Vectorizer + classifier
        self.vectorizer = CountVectorizer()
        X = self.vectorizer.fit_transform(self.patterns)
        self.classifier = LogisticRegression()
        self.classifier.fit(X, self.labels)

    def preprocess_text(self, text):
        # Convert to lowercase
        text = text.lower()
        # Remove punctuation except important ones
        text = re.sub(r'[^\w\s\?\!]', '', text)
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def predict_intent(self, message):
        # Preprocess the message
        processed_message = self.preprocess_text(message)
        X_test = self.vectorizer.transform([processed_message])
        probs = self.classifier.predict_proba(X_test)[0]
        max_prob = np.max(probs)
        pred = self.classifier.classes_[np.argmax(probs)]

        # Define intent categories with different thresholds
        basic_intents = ['greeting', 'goodbye', 'thanks']
        medium_intents = ['weather_info', 'market_prices']
        complex_intents = ['crop_recommendation', 'disease_detection', 'fertilizer_advice', 'irrigation_advice']
        
        # If confidence is very low, use fallback
        if max_prob < 0.25:
            return "fallback", "Let me think about that..."
            
        # For basic intents (greetings, etc.), use a lower threshold
        if pred in basic_intents and max_prob >= 0.4:
            for intent in self.data:
                if intent["tag"] == pred:
                    responses = intent["responses"]
                    reply = np.random.choice(responses) if responses else "Sorry, I can't respond right now."
                    return pred, reply
                    
        # For medium complexity intents, use a medium threshold
        elif pred in medium_intents and max_prob >= 0.55:
            for intent in self.data:
                if intent["tag"] == pred:
                    responses = intent["responses"]
                    reply = np.random.choice(responses) if responses else "Sorry, I can't respond right now."
                    return pred, reply
                    
        # For complex agricultural queries that need detail, use a high threshold
        elif pred in complex_intents and max_prob >= 0.7:
            for intent in self.data:
                if intent["tag"] == pred:
                    responses = intent["responses"]
                    reply = np.random.choice(responses) if responses else "Sorry, I can't respond right now."
                    return pred, reply
        
        # Default to fallback for anything else or if confidence isn't high enough
        return "fallback", "Let me provide you with more information..."
