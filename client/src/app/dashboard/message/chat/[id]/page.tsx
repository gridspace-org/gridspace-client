"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");

  // Mock conversation data
  const conversations = {
    "sarah-johnson": {
      name: "Sarah Johnson",
      workspace: "Urban Hub",
      messages: [
        {
          id: 1,
          sender: "user",
          content: "Hi! I have a question about the AV equipment setup for tomorrow's presentation",
          timestamp: "11:30",
        },
        {
          id: 2,
          sender: "host",
          content: "Hello! The AV equipment includes a 65\" display, wireless presentation system, and full sound system. Everything is ready to go!",
          timestamp: "11:35",
        },
        {
          id: 3,
          sender: "user",
          content: "Perfect! What about parking arrangements?",
          timestamp: "11:40",
        },
      ],
    },
    "mike-johnson": {
      name: "Mike Johnson",
      workspace: "Tech Hub",
      messages: [
        {
          id: 1,
          sender: "user",
          content: "Thanks for the quick response!",
          timestamp: "10:15",
        },
      ],
    },
    "alex-lee": {
      name: "Alex Lee",
      workspace: "Creative Space",
      messages: [
        {
          id: 1,
          sender: "user",
          content: "Can we reschedule for next week?",
          timestamp: "09:30",
        },
      ],
    },
  };

  const conversation = conversations[chatId as keyof typeof conversations];

  if (!conversation) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-[#002F5B] mb-4">
            Conversation not found
          </h1>
          <button
            onClick={() => router.push("/dashboard/message/conversations")}
            className="bg-[#F25417] text-white px-6 py-3 rounded-lg"
          >
            Back to Conversations
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Chat Header */}
        <div className="bg-white border border-[#D1D5DB] rounded-t-[12px] p-4 border-b border-[#D8D8D9]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/message/conversations")}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-[#002F5B]" />
            </button>
            <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {conversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                {conversation.name}
              </span>
              <span className="text-[12px] text-[#686767] leading-[15px]">
                {conversation.workspace}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white border-x border-[#D1D5DB] p-4 space-y-4 overflow-y-auto">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-[8px] p-3 max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-[#EEF7FF]"
                    : "bg-[#002F5B]"
                }`}
              >
                <p
                  className={`text-[16px] leading-[19px] mb-1 ${
                    msg.sender === "user" ? "text-[#121212]" : "text-white"
                  }`}
                >
                  {msg.content}
                </p>
                <span
                  className={`text-[10px] leading-[12px] ${
                    msg.sender === "user" ? "text-[#686767]" : "text-[#E9E6E6]"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border border-[#D1D5DB] rounded-b-[12px] p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 border border-[#002F5B] rounded-[8px] p-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type Message......."
                className="w-full text-[14px] text-[#A3A3A3] leading-[17px] outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#F25417] text-white px-4 py-3 rounded-[8px] flex items-center gap-2 hover:bg-[#E0450F] transition-colors"
            >
              <Send className="w-5 h-5" />
              <span className="text-[16px] font-bold leading-[19px]">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
