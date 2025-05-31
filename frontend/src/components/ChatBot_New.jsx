import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="chatgpt-container">
      <div className="chatgpt-header">
        <div className="chatgpt-header-content">
          <div className="chatgpt-logo">
            🌾
          </div>
          <div>
            <h1 className="chatgpt-title">AgriAI</h1>
          </div>
        </div>
      </div>

      <div className="chatgpt-messages-container">
        <div className="chatgpt-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chatgpt-message ${message.sender}`}>
              <div className="chatgpt-message-avatar">
                {message.sender === 'user' ? '👤' : '🌾'}
              </div>
              <div className="chatgpt-message-bubble">
                <div className="chatgpt-message-text">
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chatgpt-message bot">
              <div className="chatgpt-message-avatar">🌾</div>
              <div className="chatgpt-message-bubble">
                <div className="chatgpt-typing-indicator">
                  <div className="chatgpt-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="chatgpt-typing-text">Preparing response...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chatgpt-input-container">
        <form onSubmit={handleSubmit} className="chatgpt-input-form">
          <div className="chatgpt-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about farming, crops, or plant diseases..."
              className="chatgpt-input"
              disabled={isLoading}
              autoFocus
            />
            <button 
              type="submit" 
              className={`chatgpt-send-button ${inputValue.trim() && !isLoading ? 'active' : ''}`}
              disabled={!inputValue.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M7 11L12 6L17 11M12 18V7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  transform="rotate(90 12 12)"
                />
              </svg>
            </button>
          </div>
        </form>
        
        <div className="chatgpt-input-footer">
          <p className="chatgpt-disclaimer">
            AgriAI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
