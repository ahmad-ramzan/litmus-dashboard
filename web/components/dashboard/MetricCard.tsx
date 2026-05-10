interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'teal' | 'green' | 'yellow' | 'purple' | 'blue' | 'orange';
}

const colorMap = {
  teal: 'text-teal-600 bg-teal-50',
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  purple: 'text-purple-600 bg-purple-50',
  orange: 'text-orange-600 bg-orange-50',
};

export function MetricCard({ title, value, icon, trend, color = 'teal' }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1.5">
            {trend === 'up' && (
              <span className="text-xs text-green-600 flex items-center gap-0.5 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Trending up
              </span>
            )}
            {trend === 'down' && (
              <span className="text-xs text-red-500 flex items-center gap-0.5 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Trending down
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
