import { useState } from "react";
import ChatBot from '../components/ChatBot';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Namaste! Kaise madad kar sakta hoon?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const token = localStorage.getItem("token"); // JWT Token from localStorage

    if (!token) {
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
          Authorization: `Bearer ${token}`, // Token added here
        },
        body: JSON.stringify({ message: text, session_id: "default" }),
      });

      if (!res.ok) {
        throw new Error("Unauthorized ya koi aur error.");
      }

      const data = await res.json();
      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Server se jawab nahi aaya ya token invalid hai." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <ChatBot messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
