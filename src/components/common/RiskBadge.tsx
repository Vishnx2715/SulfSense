import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, ShieldAlert } from 'lucide-react';
import { RiskState } from '../../types';

interface RiskBadgeProps {
  state: RiskState;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ state, showIcon = true, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'NORMAL':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: ShieldCheck,
          label: 'NORMAL',
          glow: 'glow-emerald',
        };
      case 'CAUTION':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: AlertTriangle,
          label: 'CAUTION',
          glow: 'glow-amber',
        };
      case 'WARNING':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          icon: AlertTriangle,
          label: 'WARNING',
          glow: 'glow-amber',
        };
      case 'HAZARDOUS':
        return {
          bg: 'bg-red-50 text-red-700 border-red-300',
          icon: AlertOctagon,
          label: 'HAZARDOUS',
          glow: 'glow-crimson',
        };
      case 'DATA_INVALID':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: HelpCircle,
          label: 'DATA INVALID',
          glow: '',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-extrabold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${
        sizeClasses[size]
      } ${state === 'HAZARDOUS' ? 'animate-pulse' : ''}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};
