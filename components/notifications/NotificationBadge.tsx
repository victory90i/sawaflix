import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-gray-900 animate-in zoom-in duration-300">
      {displayCount}
    </span>
  );
};
