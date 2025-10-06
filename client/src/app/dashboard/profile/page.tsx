"use client";

import { Edit2, Mail, Phone, Check, Shield, Lock, LogOut, Trash2, MessageSquare, Bell } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [hostMessages, setHostMessages] = useState(true);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-4">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] md:text-[24px] font-semibold text-[#002F5B] leading-[24px] md:leading-[29px]">
            Profile
          </h1>
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border border-[#F25417] rounded-[8px] hover:bg-[#F25417] text-[#F25417] hover:text-white transition-colors">
            <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-[14px] md:text-[16px] font-semibold">Edit Profile</span>
          </button>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#002F5B] leading-[22px] md:leading-[24px] mb-4">
            Personal Information
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-[70px] md:w-[130px] h-[70px] md:h-[130px] bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-lg md:text-2xl font-medium">SJ</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              {/* Name Fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[16px] font-medium text-[#002F5B] leading-[19px] mb-1">
                    First Name
                  </label>
                  <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[8px] p-3">
                    <input
                      type="text"
                      value="Sarah"
                      className="w-full bg-transparent text-[14px] text-[#121212] leading-[17px] outline-none"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[16px] font-medium text-[#002F5B] leading-[19px] mb-1">
                    Last Name
                  </label>
                  <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[8px] p-3">
                    <input
                      type="text"
                      value="Johnson"
                      className="w-full bg-transparent text-[14px] text-[#121212] leading-[17px] outline-none"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[16px] font-medium text-[#002F5B] leading-[19px] mb-1">
                  Email Address
                </label>
                <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[8px] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#999999]" />
                      <span className="text-[14px] md:text-[16px] text-[#121212] leading-[17px] md:leading-[19px]">
                        sarahjohn@gmail.com
                      </span>
                    </div>
                    <Check className="w-4 h-4 text-[#2BD16A]" />
                  </div>
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-[16px] font-medium text-[#002F5B] leading-[19px] mb-1">
                  Phone Number
                </label>
                <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[8px] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#999999]" />
                      <span className="text-[14px] md:text-[16px] text-[#121212] leading-[17px] md:leading-[19px]">
                        09123456789
                      </span>
                    </div>
                    <Check className="w-4 h-4 text-[#2BD16A]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Verification Section */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#002F5B] leading-[22px] md:leading-[24px] mb-4">
            Account Verification
          </h2>
          
          <div className="space-y-4">
            {/* Email Verification */}
            <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6">
                  <Mail className="w-5 h-5 min-h-5 min-w-5 md:w-6 md:h-6 text-[#002F5B]" />
                  <div>
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-[#002F5B] leading-[19px] md:leading-[22px]">
                      Email Verification
                    </h3>
                    <p className="text-[12px] md:text-[16px] text-[#6D6D6D] leading-[15px] md:leading-[19px]">
                      Verify your email address
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-[61px] h-[25px] bg-[#DCFCE7] rounded-[100px]">
                  <span className="text-[12px] text-[#166534] leading-[15px]">verified</span>
                </div>
              </div>
            </div>

            {/* Phone Verification */}
            <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6">
                  <Phone className="w-5 h-5 min-h-5 min-w-5 md:w-6 md:h-6 text-[#002F5B]" />
                  <div>
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-[#002F5B] leading-[19px] md:leading-[22px]">
                      Phone Verification
                    </h3>
                    <p className="text-[12px] md:text-[16px] text-[#6D6D6D] leading-[15px] md:leading-[19px]">
                      Verify your phone number
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-[61px] h-[25px] bg-[#DCFCE7] rounded-[100px]">
                  <span className="text-[12px] text-[#166534] leading-[15px]">verified</span>
                </div>
              </div>
            </div>

            {/* ID Verification */}
            <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6">
                  <Shield className="w-5 h-5 min-h-5 min-w-5 md:w-6 md:h-6 text-[#002F5B]" />
                  <div>
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-[#002F5B] leading-[19px] md:leading-[22px]">
                      Identity Verification
                    </h3>
                    <p className="text-[12px] md:text-[16px] text-[#6D6D6D] leading-[15px] md:leading-[19px]">
                      Upload government ID for enhanced security
                    </p>
                  </div>
                </div>
                <button className="bg-[#F25417] text-white px-3 md:px-4 py-2 md:py-3 rounded-[8px] hover:bg-[#E0450F] transition-colors">
                  <span className="text-[12px] md:text-[16px] whitespace-nowrap font-semibold">Upload ID</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#002F5B] leading-[22px] md:leading-[24px] mb-4">
            Security
          </h2>
          
          <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-6">
                <Lock className="w-5 h-5 min-h-5 min-w-5 md:w-6 md:h-6 text-[#002F5B]" />
                <div>
                  <h3 className="text-[16px] md:text-[18px] font-semibold text-[#002F5B] leading-[19px] md:leading-[22px]">
                    Password
                  </h3>
                  <p className="text-[12px] md:text-[16px] text-[#6D6D6D] leading-[15px] md:leading-[19px]">
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <button className="border border-[#F25417] text-[#F25417] px-3 md:px-4 py-2 md:py-3 rounded-[8px] hover:bg-[#F25417] hover:text-white transition-colors">
                <span className="text-[12px] md:text-[16px] whitespace-nowrap font-semibold">Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#002F5B] leading-[22px] md:leading-[24px] mb-4 md:mb-6">
            Notification Preferences
          </h2>
          
          <div className="space-y-4 md:space-y-6">
            {/* Communication */}
            <div>
              <h3 className="text-[18px] md:text-[20px] font-medium text-[#002F5B] leading-[22px] md:leading-[24px] mb-3 md:mb-4">
                Communication
              </h3>
              <div className="space-y-3 md:space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-[#002F5B]" />
                    <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                      Email Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      emailNotifications ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        emailNotifications ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#002F5B]" />
                    <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                      SMS Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => setSmsNotifications(!smsNotifications)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      smsNotifications ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        smsNotifications ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 md:w-6 md:h-6 text-[#002F5B]" />
                    <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                      Push Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      pushNotifications ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        pushNotifications ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-[18px] md:text-[20px] font-medium text-[#002F5B] leading-[22px] md:leading-[24px] mb-3 md:mb-4">
                Content
              </h3>
              <div className="space-y-3 md:space-y-4">
                {/* Marketing Emails */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                    Marketing emails and promotions
                  </span>
                  <button
                    onClick={() => setMarketingEmails(!marketingEmails)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      marketingEmails ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        marketingEmails ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>

                {/* Booking Reminders */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                    Booking reminders and updates
                  </span>
                  <button
                    onClick={() => setBookingReminders(!bookingReminders)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      bookingReminders ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        bookingReminders ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>

                {/* Host Messages */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-[16px] md:text-[18px] text-[#121212] leading-[19px] md:leading-[22px]">
                    Messages from hosts
                  </span>
                  <button
                    onClick={() => setHostMessages(!hostMessages)}
                    className={`relative w-[48px] md:w-[63px] md:min-w-[63px] min-w-[48px] h-[26px] md:h-[34px] rounded-full transition-colors ${
                      hostMessages ? 'bg-[#F25417]' : 'bg-[#DFDFDF]'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[20px] md:w-[26px] h-[20px] md:h-[26px] bg-white rounded-full transition-transform ${
                        hostMessages ? 'translate-x-[22px] md:translate-x-[34px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="bg-white rounded-[8px] p-4 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <div className="space-y-4">
            {/* Logout */}
            <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 md:w-6 md:h-6 text-[#002F5B]" />
                <span className="text-[18px] md:text-[20px] font-semibold text-[#002F5B] leading-[22px] md:leading-[24px]">
                  Logout
                </span>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-[#F9FBFC] border border-[#E0E5EF] rounded-[12px] p-3 md:p-4">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-[#B91C1C]" />
                <span className="text-[18px] md:text-[20px] font-semibold text-[#B91C1C] leading-[22px] md:leading-[24px]">
                  Delete Account
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
