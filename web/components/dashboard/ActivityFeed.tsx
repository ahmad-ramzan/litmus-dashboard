import { timeAgo } from '@/lib/utils';
import type { ActivityItem } from '@/types';

interface ActivityFeedProps {
  items: ActivityItem[];
}

const typeConfig: Record<string, { bg: string; icon: string }> = {
  verification: { bg: 'bg-teal-100 text-teal-600', icon: '✓' },
  shift: { bg: 'bg-blue-100 text-blue-600', icon: '⟳' },
  registration: { bg: 'bg-purple-100 text-purple-600', icon: '+' },
  boost: { bg: 'bg-yellow-100 text-yellow-600', icon: '↑' },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 h-full shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Activity Feed</h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{items.length} new</span>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const config = typeConfig[item.type] || { bg: 'bg-gray-100 text-gray-500', icon: '•' };
            return (
              <li key={item.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${config.bg}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
