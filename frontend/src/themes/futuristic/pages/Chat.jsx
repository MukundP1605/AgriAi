import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';

const Chat = () => {
  const auth = useAuth();
  const { isAuthenticated, currentUser, getToken } = auth || {};
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "🌾 Namaste! How can I help you with your agricultural needs today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      try {
        const savedChats = localStorage.getItem(`chat_history_${currentUser.email}`);
        if (savedChats) {
          const parsedChats = JSON.parse(savedChats);
          setMessages(parsedChats);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }, [isAuthenticated, currentUser]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (isAuthenticated && currentUser && messages.length > 1) {
      try {
        localStorage.setItem(`chat_history_${currentUser.email}`, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages, isAuthenticated, currentUser]);

  const sendMessage = async (text) => {
    const userMsg = { 
      sender: "user", 
      text, 
      timestamp: new Date().toISOString() 
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const token = getToken ? getToken() : localStorage.getItem('token');

    if (!isAuthenticated || !token) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "⚠️ Please login first to continue chatting.",
          timestamp: new Date().toISOString()
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: text, 
          session_id: currentUser?.email || "default" 
        }),
      });

      if (!res.ok) {
        throw new Error("Unauthorized ya koi aur error.");
      }

      const data = await res.json();
      const botMsg = { 
        sender: "bot", 
        text: data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMsg]);

      // Save chat to backend for dashboard tracking
      try {
        await fetch("http://127.0.0.1:8000/api/user/history/save-chat-enhanced", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_email: currentUser?.email,
            user_message: text,
            bot_reply: data.reply,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (saveErr) {
        // Optionally log error, but do not block chat
        console.error("Failed to save chat to dashboard:", saveErr);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "❌ Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
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
      sendMessage(prompt);
    }
  };

  return (
    <div>
      <h1>Chat with AgriAI Assistant</h1>
      
      <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.length === 1 && (
          <div>
            <h3>Quick Prompts:</h3>
            {quickPrompts.map((prompt, index) => (
              <button 
                key={index} 
                onClick={() => handleQuickPrompt(prompt)}
                style={{ margin: '5px', padding: '5px 10px' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px', 
              textAlign: message.sender === 'user' ? 'right' : 'left' 
            }}
          >
            <div 
              style={{ 
                display: 'inline-block', 
                padding: '10px', 
                backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f1f1',
                color: message.sender === 'user' ? 'white' : 'black',
                borderRadius: '10px',
                maxWidth: '70%'
              }}
            >
              {message.text}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px', 
              backgroundColor: '#f1f1f1',
              borderRadius: '10px'
            }}>
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ width: '80%', padding: '10px' }}
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
          style={{ width: '18%', padding: '10px', marginLeft: '2%' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
