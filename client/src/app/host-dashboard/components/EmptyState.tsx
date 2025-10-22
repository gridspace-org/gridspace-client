import { Plus, Home, Calendar, DollarSign, MessageCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type: "listings" | "bookings" | "earnings" | "messages";
  title: string;
  description: string;
  actionText: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  icon,
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case "listings":
        return <Home className="w-16 h-16 text-gray-400" />;
      case "bookings":
        return <Calendar className="w-16 h-16 text-gray-400" />;
      case "earnings":
        return <DollarSign className="w-16 h-16 text-gray-400" />;
      case "messages":
        return <MessageCircle className="w-16 h-16 text-gray-400" />;
      default:
        return <Home className="w-16 h-16 text-gray-400" />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-6">
        {icon || getDefaultIcon()}
      </div>
      
      <h3 className="text-xl font-semibold text-[#002F5B] mb-2">
        {title}
      </h3>
      
      <p className="text-[#686767] mb-6 max-w-md">
        {description}
      </p>
      
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F25417] text-white rounded-lg font-semibold hover:bg-[#E0440F] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {actionText}
        </Link>
      ) : onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F25417] text-white rounded-lg font-semibold hover:bg-[#E0440F] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {actionText}
        </button>
      ) : null}
    </div>
  );

  return content;
}

