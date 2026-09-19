import React from 'react';
import {
  Activity,
  Droplets,
  Thermometer,
  Zap,
  Layers,
  Sparkles,
  Eye,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { SensorTelemetry } from '../../types';

interface LiveSensorMonitorProps {
  telemetry: SensorTelemetry;
  telemetryHistory: SensorTelemetry[];
}

export const LiveSensorMonitor: React.FC<LiveSensorMonitorProps> = ({ telemetry, telemetryHistory }) => {
  // Format data for Recharts
  const chartData = telemetryHistory.map((t, idx) => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    r: t.rawColor.r,
    g: t.rawColor.g,
    b: t.rawColor.b,
    clear: t.rawColor.clear,
    deltaE: t.deltaE,
    L: t.lab.L,
    a: t.lab.a,
    bLab: t.lab.b,
    dose: t.estimatedDose,
    temp: t.temperature,
    humidity: t.humidity,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-navy-600 uppercase tracking-wider">
              Optical Telemetry Pipeline (TCS34725 / AS7341)
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">Live Colorimetric Sensor Monitor</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time sRGB optical reflectance, CIE-LAB color space mapping, and digital noise filtering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-navy-50 rounded-xl border border-navy-100 text-xs text-navy-800 font-mono">
            Device: <strong>{telemetry.deviceId}</strong>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Signal: {telemetry.readingQuality}
          </div>
        </div>
      </div>

      {/* Real-Time Optical Channel Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-red-700 uppercase mb-1">Raw Red Channel</div>
          <div className="text-2xl font-mono font-extrabold text-red-600">{telemetry.rawColor.r}</div>
          <span className="text-[10px] text-gray-400">8-bit ADC (0-255)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Raw Green Channel</div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600">{telemetry.rawColor.g}</div>
          <span className="text-[10px] text-gray-400">8-bit ADC (0-255)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-blue-700 uppercase mb-1">Raw Blue Channel</div>
          <div className="text-2xl font-mono font-extrabold text-blue-600">{telemetry.rawColor.b}</div>
          <span className="text-[10px] text-gray-400">8-bit ADC (0-255)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">Clear / Lux Channel</div>
          <div className="text-2xl font-mono font-extrabold text-amber-600">{telemetry.rawColor.clear}</div>
          <span className="text-[10px] text-gray-400">Broadband Photons</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-purple-700 uppercase mb-1">CIE Delta-E (ΔE)</div>
          <div className="text-2xl font-mono font-extrabold text-purple-600">{telemetry.deltaE.toFixed(1)}</div>
          <span className="text-[10px] text-gray-400">Perceptual Shift</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-navy-100 shadow-navy-sm">
          <div className="text-[10px] font-bold text-navy-700 uppercase mb-1">Ambient Temp / RH</div>
          <div className="text-xl font-mono font-extrabold text-navy-900">
            {telemetry.temperature}°C / {telemetry.humidity}%
          </div>
          <span className="text-[10px] text-gray-400">SHT31 Sensor</span>
        </div>
      </div>

      {/* Main Charts: RGB Color Trajectory + Delta-E Degradation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optical RGB Degradation Chart */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-navy-sm card-3d-hover">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950">RGB Optical Channels vs Time</h3>
              <p className="text-xs text-gray-500">Reflectance decay as chemical strip precipitates</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
                <YAxis domain={[0, 260]} stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E224D',
                    borderColor: '#1D458F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="r" stroke="#DC2626" strokeWidth={2} dot={false} name="Red Channel" />
                <Line type="monotone" dataKey="g" stroke="#059669" strokeWidth={2} dot={false} name="Green Channel" />
                <Line type="monotone" dataKey="b" stroke="#2563EB" strokeWidth={2} dot={false} name="Blue Channel" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delta-E Color Distance & Cumulative Dose */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-navy-sm card-3d-hover">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950">CIE76 ΔE & Estimated Dose Progression</h3>
              <p className="text-xs text-gray-500">Non-linear chemical kinetics inversion</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
                <YAxis yAxisId="left" stroke="#8B5CF6" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" stroke="#0E224D" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E224D',
                    borderColor: '#1D458F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="deltaE"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                  name="Delta E (ΔE)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="dose"
                  stroke="#0E224D"
                  strokeWidth={2.5}
                  dot={false}
                  name="Estimated Dose (ppm·min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Signal Preprocessing & Optical Diagnostics Breakdown */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5">
        <h3 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-navy-600" />
          Optical Signal Preprocessing Pipeline Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
            <span className="font-bold text-navy-900 block mb-1">1. Raw ADC Capture</span>
            <p className="text-gray-500 text-[11px]">TCS34725 16-bit integration registers ($R, G, B, C$) sampled at 100Hz.</p>
          </div>
          <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
            <span className="font-bold text-navy-900 block mb-1">2. Noise Filtering</span>
            <p className="text-gray-500 text-[11px]">5-point median filter + exponential moving average suppresses electronic spikes.</p>
          </div>
          <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
            <span className="font-bold text-navy-900 block mb-1">3. CIE-LAB Conversion</span>
            <p className="text-gray-500 text-[11px]">D65 standard illuminant mapping translates RGB into perceptual $L^*, a^*, b^*$.</p>
          </div>
          <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
            <span className="font-bold text-navy-900 block mb-1">4. Environmental Matrix</span>
            <p className="text-gray-500 text-[11px]">Temperature & moisture coefficients compensate chemical reaction kinetics.</p>
          </div>
          <div className="p-3 bg-navy-50/70 rounded-xl border border-navy-100">
            <span className="font-bold text-navy-900 block mb-1">5. AI Dose Estimation</span>
            <p className="text-gray-500 text-[11px]">Calibrated regression model yields dose in $ppm \cdot min \pm \sigma$.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
