"use client";

import Navigation from "../components/Navigation";

interface SearchLayoutProps {
  children: React.ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <Navigation />
      {children}
    </div>
  );
}
