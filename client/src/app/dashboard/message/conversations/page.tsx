"use client";

import { ArrowLeft, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConversationsPage() {
  const router = useRouter();

  const conversations = [
    {
      id: "sarah-johnson",
      name: "Sarah Johnson",
      workspace: "Urban Hub",
      lastMessage: "Hi! I have a question about the AV equipm......",
      unreadCount: 2,
      isActive: true,
    },
    {
      id: "mike-johnson",
      name: "Mike Johnson",
      workspace: "Tech Hub",
      lastMessage: "Thanks for the quick response!",
      unreadCount: 0,
      isActive: false,
    },
    {
      id: "alex-lee",
      name: "Alex Lee",
      workspace: "Creative Space",
      lastMessage: "Can we reschedule for next week?",
      unreadCount: 0,
      isActive: false,
    },
  ];

  const handleConversationClick = (conversationId: string) => {
    router.push(`/dashboard/message/chat/${conversationId}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-[#002F5B]" />
            </button>
            <h1 className="text-[32px] font-bold text-[#002F5B] leading-[39px]">
              Messages
            </h1>
          </div>
          <p className="text-[18px] text-[#686767] leading-[22px] tracking-[-0.25px]">
            Chat with host about workspace bookings
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-[#A8A7A7]" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F5B]"
            />
          </div>
          <button className="p-3 border border-[#D1D5DB] rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-[#A8A7A7]" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="bg-white border border-[#D1D5DB] rounded-[12px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <div className="p-4 border-b border-[#D8D8D9]">
            <h2 className="text-[18px] font-semibold text-[#002F5B] leading-[22px]">
              Conversations
            </h2>
          </div>

          <div className="divide-y divide-[#D8D8D9]">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  conversation.isActive ? "bg-[#EEF7FF]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {conversation.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px] truncate">
                          {conversation.name}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <div className="flex items-center justify-center w-[19px] h-[19px] bg-[#F25417] rounded-full flex-shrink-0">
                            <span className="text-[10px] font-semibold text-white leading-[12px]">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[12px] text-[#686767] leading-[15px]">
                        {conversation.workspace}
                      </span>
                      <span
                        className={`text-[14px] leading-[17px] truncate ${
                          conversation.isActive
                            ? "font-semibold text-[#121212]"
                            : "text-[#121212]"
                        }`}
                      >
                        {conversation.lastMessage}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
