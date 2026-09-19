import React from 'react';
import {
  Bell,
  Download,
  Wifi,
  Sliders,
  Shield,
  UserCheck,
  Zap,
  Activity,
  Smartphone,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  onOpenSimulator: () => void;
  onOpenWearableModal: () => void;
  isInstallable: boolean;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  unreadAlertCount,
  onOpenAlerts,
  onOpenSimulator,
  onOpenWearableModal,
  isInstallable,
  onInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-navy-100 shadow-navy-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center text-white shadow-md border border-navy-700">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-navy-950">SULFSENSE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-100 text-navy-800 border border-navy-200">
                PWA v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              AI Quantitative Passive H₂S Dosimeter Platform
            </p>
          </div>
        </div>

        {/* Center Pill: Simulation Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1 bg-amber-50/80 border border-amber-200/80 rounded-full text-xs text-amber-900 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>DEMO SIMULATION ACTIVE</span>
          <span className="text-amber-500">|</span>
          <button
            onClick={onOpenSimulator}
            className="font-bold underline hover:text-amber-950 flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" /> Adjust ESP32
          </button>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-2.5">
          {/* Wearable Watch Mode Shortcut */}
          <button
            onClick={onOpenWearableModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-navy-50 text-navy-700 hover:bg-navy-100 border border-navy-200 transition-all"
            title="Open Worker OLED Watch Simulator"
          >
            <Smartphone className="w-3.5 h-3.5 text-navy-600" />
            <span className="hidden sm:inline">Wearable View</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-navy-50 p-1 rounded-xl border border-navy-200 text-xs">
            <button
              onClick={() => onRoleChange('supervisor')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'supervisor'
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-navy-700 hover:text-navy-950'
              }`}
            >
              Supervisor
            </button>
            <button
              onClick={() => onRoleChange('worker')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'worker'
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-navy-700 hover:text-navy-950'
              }`}
            >
              Worker
            </button>
          </div>

          {/* Alert Notifications Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-navy-700 hover:bg-navy-50 border border-transparent hover:border-navy-200 transition-all"
            aria-label="Open Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-navy-700 to-navy-900 text-white hover:from-navy-800 hover:to-navy-950 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
