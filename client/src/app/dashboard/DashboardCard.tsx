import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

export default function DashboardCard({
  icon: Icon,
  title,
  description,
  onClick,
  href,
  disabled,
}: DashboardCardProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center p-[10px] gap-3 h-[171px] bg-white border-[0.5px] border-[#D1D5DB] rounded-xl shadow-[0px_4px_4px_rgba(222,222,222,0.25)] transition-shadow ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0px_6px_6px_rgba(222,222,222,0.35)]'
      }`}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : 0}
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

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={title}>
        {content}
      </Link>
    );
  }

  return content;
}
