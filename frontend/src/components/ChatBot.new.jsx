import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const ChatBot = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adjustTextareaHeight = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chatgpt-container">
      {/* Header */}
      <div className="chatgpt-header">
        <div className="chatgpt-header-content">
          <div className="chatgpt-logo">
            🌱
          </div>
          <div>
            <h1 className="chatgpt-title">AgriAI Assistant</h1>
            <p className="chatgpt-subtitle">Your intelligent farming companion</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chatgpt-messages">
        <div className="chatgpt-messages-container">
          {messages.length === 0 ? (
            <div className="chatgpt-welcome">
              <div className="chatgpt-welcome-icon">
                ✨
              </div>
              <h2 className="chatgpt-welcome-title">Welcome to AgriAI</h2>
              <p className="chatgpt-welcome-subtitle">
                Your intelligent farming assistant. Ask me anything about crops, diseases, farming techniques, or agricultural insights.
              </p>
              <div className="chatgpt-welcome-features">
                <div className="chatgpt-feature-card">
                  <span className="chatgpt-feature-icon">🌾</span>
                  <h3 className="chatgpt-feature-title">Crop Management</h3>
                  <p className="chatgpt-feature-description">
                    Get expert advice on planting, harvesting, and crop rotation strategies
                  </p>
                </div>
                <div className="chatgpt-feature-card">
                  <span className="chatgpt-feature-icon">🦠</span>
                  <h3 className="chatgpt-feature-title">Disease Detection</h3>
                  <p className="chatgpt-feature-description">
                    Identify and treat plant diseases, pests, and nutrient deficiencies
                  </p>
                </div>
                <div className="chatgpt-feature-card">
                  <span className="chatgpt-feature-icon">🌱</span>
                  <h3 className="chatgpt-feature-title">Smart Farming</h3>
                  <p className="chatgpt-feature-description">
                    Learn modern agricultural techniques and sustainable farming practices
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className="chatgpt-message">
                  {msg.sender === 'user' ? (
                    <div className="chatgpt-message-user">
                      <div className="chatgpt-bubble chatgpt-bubble-user">
                        {msg.text}
                      </div>
                      <div className="chatgpt-avatar chatgpt-avatar-user">
                        U
                      </div>
                    </div>
                  ) : (
                    <div className="chatgpt-message-assistant">
                      <div className="chatgpt-avatar chatgpt-avatar-assistant">
                        AI
                      </div>
                      <div className="chatgpt-bubble chatgpt-bubble-assistant">
                        <ReactMarkdown 
                          components={{
                            p: ({children}) => <p style={{margin: '0 0 12px 0'}}>{children}</p>,
                            ul: ({children}) => <ul style={{margin: '12px 0', paddingLeft: '20px'}}>{children}</ul>,
                            ol: ({children}) => <ol style={{margin: '12px 0', paddingLeft: '20px'}}>{children}</ol>,
                            li: ({children}) => <li style={{margin: '4px 0'}}>{children}</li>,
                            strong: ({children}) => <strong>{children}</strong>,
                            em: ({children}) => <em>{children}</em>
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="chatgpt-typing">
                  <div className="chatgpt-avatar chatgpt-avatar-assistant">
                    AI
                  </div>
                  <div className="chatgpt-typing-bubble">
                    <div className="chatgpt-typing-dots">
                      <div className="chatgpt-typing-dot"></div>
                      <div className="chatgpt-typing-dot"></div>
                      <div className="chatgpt-typing-dot"></div>
                    </div>
                    <span className="chatgpt-typing-text">AgriAI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="chatgpt-input-area">
        <div className="chatgpt-input-container">
          <div className="chatgpt-input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onInput={adjustTextareaHeight}
              placeholder="Ask AgriAI anything about farming, crops, or plant diseases..."
              disabled={isLoading}
              rows={1}
              className="chatgpt-input"
            />
            <div className="chatgpt-input-controls">
              {input.trim() && input.length > 20 && (
                <div className="chatgpt-char-counter">
                  {input.length}/2000
                </div>
              )}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="chatgpt-send-button"
                title="Send message"
              >
                ➤
              </button>
            </div>
          </div>
          
          <p className="chatgpt-footer-note">
            ✨ AgriAI can make mistakes. Consider verifying important agricultural information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
