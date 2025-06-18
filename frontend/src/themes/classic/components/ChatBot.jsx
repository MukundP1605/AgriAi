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

  const quickPrompts = [
    "Namaste! Kaise madad kar sakta hoon?",
    "Hi there! What can I do for you?",
    "recommend crop"
  ];

  const handleQuickPrompt = (prompt) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="modern-chat-container">
      {/* Chat Messages Area */}
      <div className="chat-messages-area">
        {messages.length === 1 && (
          <div className="welcome-section">
            <div className="welcome-content">
              {quickPrompts.map((prompt, index) => (
                <div 
                  key={index} 
                  className="quick-prompt-bubble"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="messages-list">
          {messages.map((message, index) => (
            <div key={index} className={`message-container ${message.sender}`}>
              {message.sender === 'bot' && (
                <div className="bot-avatar">
                  <div className="avatar-icon">🌾</div>
                </div>
              )}              <div className={`message-bubble ${message.sender}`}
                style={{
                  background: message.sender === 'bot' ? '#e9ecef' : '#007bff',
                  border: message.sender === 'bot' ? '1px solid #ced4da' : 'none'
                }}>
                <div className="message-text" style={{
                  color: message.sender === 'bot' ? 'black' : 'white',
                  fontWeight: 'normal'
                }}>
                  {message.text}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="user-avatar">
                  <div className="avatar-icon">👤</div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message-container bot">
              <div className="bot-avatar">
                <div className="avatar-icon">🌾</div>
              </div>
              <div className="message-bubble bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about farming, crops, or plant diseases..."
                className="message-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="send-button"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
