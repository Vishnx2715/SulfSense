import React from 'react';
import {
  X,
  User,
  Radio,
  Clock,
  ShieldCheck,
  TrendingUp,
  Thermometer,
  Droplets,
  Activity,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Worker, SensorTelemetry } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';

interface WorkerDetailViewProps {
  worker: Worker | null;
  onClose: () => void;
  telemetryHistory: SensorTelemetry[];
  latestTelemetry: SensorTelemetry;
}

export const WorkerDetailView: React.FC<WorkerDetailViewProps> = ({
  worker,
  onClose,
  telemetryHistory,
  latestTelemetry,
}) => {
  if (!worker) return null;

  const isLiveWorker = worker.id === 'W-101';
  const currentDose = isLiveWorker ? latestTelemetry.estimatedDose : worker.currentDose;
  const risk = isLiveWorker ? latestTelemetry.riskState : worker.riskState;
  const temp = isLiveWorker ? latestTelemetry.temperature : 26.8;
  const humidity = isLiveWorker ? latestTelemetry.humidity : 51.5;

  const chartData = telemetryHistory.map((t) => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dose: isLiveWorker ? t.estimatedDose : worker.currentDose,
    temp: t.temperature,
    humidity: t.humidity,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-navy-100 shadow-navy-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-white font-black flex items-center justify-center text-sm">
              {worker.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{worker.name}</h2>
                <span className="text-xs font-mono text-cyan-300">({worker.id})</span>
              </div>
              <p className="text-xs text-navy-200">
                {worker.role} • {worker.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Estimated Cumulative Dose
              </span>
              <div className="text-xl font-mono font-extrabold text-navy-950">
                {currentDose.toFixed(1)}{' '}
                <span className="text-[10px] font-sans font-normal text-gray-500">ppm·min</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Uncertainty: ±4.8 ppm·min</span>
            </div>

            <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Risk State</span>
              <div className="mt-1">
                <RiskBadge state={risk} size="sm" />
              </div>
              <span className="text-[10px] text-gray-400 block mt-1">Action Level: 100</span>
            </div>

            <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Assigned Wearable
              </span>
              <div className="text-sm font-mono font-bold text-navy-900 mt-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-navy-600" />
                {worker.assignedDeviceId || 'None'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Status: Active</span>
            </div>

            <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Ambient Temp / RH</span>
              <div className="text-sm font-mono font-bold text-navy-900 mt-1">
                {temp}°C / {humidity}%
              </div>
              <span className="text-[10px] text-gray-400 block mt-1">SHT31 Sensor</span>
            </div>
          </div>

          {/* Exposure History Time Series */}
          <div className="bg-white rounded-xl border border-navy-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
              Cumulative Shift Exposure Trend (ppm·min)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E224D',
                      borderColor: '#1D458F',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="dose" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift Timeline Events */}
          <div>
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
              Worker Shift Timeline Events
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="flex items-center gap-2 text-navy-900 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Dosimeter Strip Badge Initialized & Calibrated
                </span>
                <span className="font-mono text-[11px] text-gray-400">06:00:00 AM</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="flex items-center gap-2 text-navy-900 font-medium">
                  <Radio className="w-4 h-4 text-blue-600" />
                  ESP32 Wristband Bluetooth / WiFi Gateway Handshake
                </span>
                <span className="font-mono text-[11px] text-gray-400">06:02:15 AM</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="flex items-center gap-2 text-navy-900 font-medium">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Routine Air Quality Scan: Ambient &lt;0.5 ppm
                </span>
                <span className="font-mono text-[11px] text-gray-400">08:30:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-navy-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-bold hover:bg-navy-900 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
