import { Calendar, CalendarX, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface BookingEmptyStateProps {
  type: 'user' | 'host' | 'admin';
  status?: 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'all';
  onActionClick?: () => void;
}

export default function BookingEmptyState({ type, status = 'all', onActionClick }: BookingEmptyStateProps) {
  const getEmptyStateContent = () => {
    if (type === 'user') {
      switch (status) {
        case 'pending':
          return {
            icon: <Clock className="w-16 h-16 text-[#F25417]" />,
            title: "No Pending Bookings",
            description: "You don't have any bookings waiting for host confirmation.",
            actionText: "Browse Spaces",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        case 'upcoming':
          return {
            icon: <Calendar className="w-16 h-16 text-[#002F5B]" />,
            title: "No Upcoming Bookings",
            description: "You don't have any confirmed bookings scheduled for the future.",
            actionText: "Find a Space",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        case 'completed':
          return {
            icon: <CheckCircle className="w-16 h-16 text-green-500" />,
            title: "No Completed Bookings",
            description: "You haven't completed any bookings yet. Your completed bookings will appear here.",
            actionText: "Browse Spaces",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        case 'cancelled':
          return {
            icon: <XCircle className="w-16 h-16 text-red-500" />,
            title: "No Cancelled Bookings",
            description: "You don't have any cancelled bookings. Cancelled bookings will appear here.",
            actionText: "Browse Spaces",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        default:
          return {
            icon: <Calendar className="w-16 h-16 text-[#002F5B]" />,
            title: "No Bookings Yet",
            description: "You haven't made any bookings yet. Start by finding the perfect workspace for your needs.",
            actionText: "Browse Spaces",
            actionIcon: <Calendar className="w-5 h-5" />
          };
      }
    }

    if (type === 'host') {
      switch (status) {
        case 'pending':
          return {
            icon: <Clock className="w-16 h-16 text-[#F25417]" />,
            title: "No Pending Bookings",
            description: "You don't have any bookings waiting for your confirmation.",
            actionText: "View All Bookings",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        case 'upcoming':
          return {
            icon: <CheckCircle className="w-16 h-16 text-green-500" />,
            title: "No Upcoming Bookings",
            description: "You don't have any confirmed bookings for your spaces.",
            actionText: "View All Bookings",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        case 'cancelled':
          return {
            icon: <XCircle className="w-16 h-16 text-red-500" />,
            title: "No Cancelled Bookings",
            description: "You don't have any cancelled bookings for your spaces.",
            actionText: "View All Bookings",
            actionIcon: <Calendar className="w-5 h-5" />
          };
        default:
          return {
            icon: <Calendar className="w-16 h-16 text-[#002F5B]" />,
            title: "No Bookings Yet",
            description: "You don't have any bookings for your spaces yet. Promote your spaces to get more bookings.",
            actionText: "Manage Listings",
            actionIcon: <Calendar className="w-5 h-5" />
          };
      }
    }

    if (type === 'admin') {
      return {
        icon: <AlertCircle className="w-16 h-16 text-[#002F5B]" />,
        title: "No Bookings Found",
        description: "There are no bookings matching your current filters.",
        actionText: "Clear Filters",
        actionIcon: <CalendarX className="w-5 h-5" />
      };
    }

    return {
      icon: <Calendar className="w-16 h-16 text-[#002F5B]" />,
      title: "No Bookings",
      description: "No bookings found.",
      actionText: "Refresh",
      actionIcon: <Calendar className="w-5 h-5" />
    };
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-[#002F5B] text-xl font-semibold mb-3 text-center">
        {content.title}
      </h3>
      
      <p className="text-[#686767] text-base text-center mb-8 max-w-md">
        {content.description}
      </p>
      
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#F25417] text-white rounded-lg font-medium hover:bg-[#E0440F] transition-colors"
        >
          {content.actionIcon}
          {content.actionText}
        </button>
      )}
    </div>
  );
}
