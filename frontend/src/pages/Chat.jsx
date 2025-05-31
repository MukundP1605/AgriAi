import { useState, useEffect } from "react";
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { isAuthenticated, currentUser, getToken } = useAuth();  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you with your agricultural needs?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const token = getToken();

    if (!isAuthenticated || !token) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Kripya pehle login kijiye. Auth token missing hai." },
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
      const botMsg = { sender: "bot", text: data.reply };
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
        { sender: "bot", text: "❌ Server se jawab nahi aaya ya token invalid hai." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1">
        <ChatBot messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
