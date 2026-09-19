import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  Users,
  Radio,
  FileText,
  Sparkles,
  Sliders,
  Settings,
  ShieldAlert,
  Info,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'sensor-monitor'
  | 'calibration-studio'
  | 'workers'
  | 'devices'
  | 'reports'
  | 'landing';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, alertCount }) => {
  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'dashboard', label: 'Supervisor Dashboard', icon: LayoutDashboard },
    { id: 'sensor-monitor', label: 'Live Optical Telemetry', icon: Activity },
    { id: 'calibration-studio', label: 'AI Calibration Engine', icon: Cpu, badge: 'v2.1' },
    { id: 'workers', label: 'Workforce Roster', icon: Users },
    { id: 'devices', label: 'ESP32 Device Fleet', icon: Radio },
    { id: 'reports', label: 'Exposure Reports & PDF', icon: FileText },
    { id: 'landing', label: 'System Overview & Docs', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-navy-100 flex flex-col justify-between p-4 shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 block">
            Core Monitoring
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-navy-800 text-white shadow-navy-sm'
                      : 'text-navy-700 hover:bg-navy-50 hover:text-navy-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-300' : 'text-navy-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-navy-700 text-blue-200' : 'bg-navy-100 text-navy-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Industrial Principle Note */}
        <div className="p-3.5 bg-navy-50/70 border border-navy-100 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
            <Info className="w-3.5 h-3.5 text-navy-600" />
            <span>Passive Dose Metric</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Values reflect <strong>cumulative exposure ($ppm \cdot min$)</strong> derived from calibrated chemical strip colorimetry, not instantaneous gas ppm.
          </p>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-navy-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-navy-800">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ESP32 Gateway Connected
          </span>
          <span className="font-mono text-[11px] text-gray-500">100Hz</span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">
          SulfSense Safety Standard v2.4
        </div>
      </div>
    </aside>
  );
};
