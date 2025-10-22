"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Send } from "lucide-react";

export default function MessagePage() {
  const router = useRouter();

  useEffect(() => {
    // On mobile, redirect to conversations list
    // On desktop, show the full interface
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        router.push("/dashboard/message/conversations");
      }
    };

    // Check initial screen size
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#002F5B] leading-[39px]">
            Messages
          </h1>
          <p className="text-[18px] text-[#686767] leading-[22px] tracking-[-0.25px]">
            Chat with host about workspace bookings
          </p>
        </div>

        {/* Desktop Layout - Full Chat Interface */}
        <div className="hidden lg:flex flex-row gap-5">
          {/* Conversations Sidebar */}
          <div className="w-[401px] bg-white border border-[#D1D5DB] rounded-[12px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#D8D8D9]">
              <h2 className="text-[18px] font-semibold text-[#002F5B] leading-[22px]">
                Conversations
              </h2>
            </div>

            {/* Conversation List */}
            <div className="flex flex-col">
              {/* Conversation 1 - Active */}
              <div className="p-4 border-b border-[#D8D8D9] bg-[#EEF7FF]">
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">SJ</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                        Sarah Johnson
                      </span>
                      <span className="text-[12px] text-[#686767] leading-[15px]">
                        Urban Hub
                      </span>
                      <span className="text-[14px] font-semibold text-[#121212] leading-[17px]">
                        Hi! I have a question about the AV equipm......
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-[19px] h-[19px] bg-[#F25417] rounded-full">
                    <span className="text-[10px] font-semibold text-white leading-[12px]">2</span>
                  </div>
                </div>
              </div>

              {/* Conversation 2 */}
              <div className="p-4 border-b border-[#D8D8D9]">
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">MJ</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                        Mike Johnson
                      </span>
                      <span className="text-[12px] text-[#686767] leading-[15px]">
                        Tech Hub
                      </span>
                      <span className="text-[14px] text-[#121212] leading-[17px]">
                        Thanks for the quick response!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation 3 */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">AL</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                        Alex Lee
                      </span>
                      <span className="text-[12px] text-[#686767] leading-[15px]">
                        Creative Space
                      </span>
                      <span className="text-[14px] text-[#121212] leading-[17px]">
                        Can we reschedule for next week?
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#D8D8D9]">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">SJ</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                    Sarah Johnson
                  </span>
                  <span className="text-[12px] text-[#686767] leading-[15px]">
                    Urban Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {/* User Message 1 */}
              <div className="flex justify-end">
                <div className="bg-[#EEF7FF] rounded-[8px] p-3 max-w-[418px]">
                  <p className="text-[16px] text-[#121212] leading-[19px] mb-1">
                    Hi! I have a question about the AV equipment setup for tomorrow&apos;s presentation
                  </p>
                  <span className="text-[10px] text-[#686767] leading-[12px]">11:30</span>
                </div>
              </div>

              {/* Host Response */}
              <div className="flex justify-start">
                <div className="bg-[#002F5B] rounded-[8px] p-3 max-w-[449px]">
                  <p className="text-[16px] text-white leading-[19px] mb-1">
                    Hello! The AV equipment includes a 65&quot; display, wireless presentation system, and full sound system. Everything is ready to go!
                  </p>
                  <span className="text-[10px] text-[#E9E6E6] leading-[12px]">11:35</span>
                </div>
              </div>

              {/* User Message 2 */}
              <div className="flex justify-end">
                <div className="bg-[#EEF7FF] rounded-[8px] p-3 max-w-[372px]">
                  <p className="text-[16px] text-[#121212] leading-[19px] mb-1">
                    Perfect! What about parking arrangements?
                  </p>
                  <span className="text-[10px] text-[#686767] leading-[12px]">11:40</span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#D8D8D9]">
              <div className="flex items-center gap-2">
                <div className="flex-1 border border-[#002F5B] rounded-[8px] p-3">
                  <input
                    type="text"
                    placeholder="Type Message......."
                    className="w-full text-[14px] text-[#A3A3A3] leading-[17px] outline-none"
                  />
                </div>
                <button className="bg-[#F25417] text-white px-4 py-3 rounded-[8px] flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span className="text-[16px] font-bold leading-[19px]">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Redirect Message */}
        <div className="lg:hidden flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#002F5B] mb-4">
              Redirecting to Conversations...
            </h2>
            <p className="text-[16px] text-[#686767] mb-6">
              On mobile devices, conversations are displayed in a separate view for better usability.
            </p>
            <button
              onClick={() => router.push("/dashboard/message/conversations")}
              className="bg-[#F25417] text-white px-6 py-3 rounded-lg hover:bg-[#E0450F] transition-colors"
            >
              Go to Conversations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
