"use client";

import { useState } from "react";
import { Home, User, Calendar, LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => (
  <button
    className={`flex items-center px-4 py-2 sm:py-3 gap-2 sm:gap-3 w-full h-8 sm:h-10 rounded ${
      isActive ? "bg-[#F25417] text-white" : "text-[#121212] hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
    <span className="text-sm sm:text-base lg:text-[18px]">{label}</span>
  </button>
);

export default function AdminSidebar() {
  const [activeItem, setActiveItem] = useState("Listing Management");

  const sidebarItems = [
    { icon: Home, label: "Listing Management" },
    { icon: User, label: "User Management" },
    { icon: Calendar, label: "Booking Management" },
  ];

  return (
    <div className="w-full lg:w-[295px] h-auto lg:h-[837px] bg-white shadow-sm rounded-lg p-0">
      <div className="flex flex-col lg:flex-col gap-2 sm:gap-3 p-0 mt-4 sm:mt-8 lg:mt-16">
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </div>
    </div>
  );
}
