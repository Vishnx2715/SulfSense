import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: 'default' | 'danger' | 'warning' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = 'default',
}) => {
  const getHighlightClasses = () => {
    switch (highlight) {
      case 'danger':
        return 'border-red-200 bg-red-50/40 text-red-700';
      case 'warning':
        return 'border-amber-200 bg-amber-50/40 text-amber-800';
      case 'success':
        return 'border-emerald-200 bg-emerald-50/40 text-emerald-700';
      default:
        return 'border-navy-100 bg-white text-navy-800';
    }
  };

  const getIconContainerClasses = () => {
    switch (highlight) {
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'success':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-navy-50 text-navy-600';
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-navy-sm card-3d-hover transition-all duration-300 ${getHighlightClasses()}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-navy-950 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border border-white/60 shadow-sm ${getIconContainerClasses()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs">
          {trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-700' : 'text-red-600'}`}>
            {trend.value}
          </span>
          <span className="text-gray-400 text-[11px]">vs last shift</span>
        </div>
      )}
    </div>
  );
};
