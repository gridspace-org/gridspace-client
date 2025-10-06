import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function DashboardCard({
  icon: Icon,
  title,
  description,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-[10px] gap-3 h-[171px] bg-white border-[0.5px] border-[#D1D5DB] rounded-xl shadow-[0px_4px_4px_rgba(222,222,222,0.25)] cursor-pointer hover:shadow-[0px_6px_6px_rgba(222,222,222,0.35)] transition-shadow"
      onClick={onClick}
    >
      <Icon className="w-10 h-10 text-[#002F5B]" />
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-[18px] font-bold text-[#002F5B] leading-[22px]">
          {title}
        </h3>
        <p className="text-[14px] text-[#686767] text-center leading-[17px] tracking-[-0.25px]">
          {description}
        </p>
      </div>
    </div>
  );
}
