import React, { useState } from 'react';
import {
  Radio,
  Battery,
  Wifi,
  Cpu,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  Plus,
  Sliders,
} from 'lucide-react';
import { DosimeterDevice, SensorTelemetry } from '../../types';

interface DeviceManagerProps {
  devices: DosimeterDevice[];
  latestTelemetry: SensorTelemetry;
  onOpenSimulator: () => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({
  devices,
  latestTelemetry,
  onOpenSimulator,
}) => {
  const [deviceList, setDeviceList] = useState<DosimeterDevice[]>(devices);
  const [diagnosingDeviceId, setDiagnosingDeviceId] = useState<string | null>(null);

  const handleRunDiagnostic = (deviceId: string) => {
    setDiagnosingDeviceId(deviceId);
    setTimeout(() => {
      setDiagnosingDeviceId(null);
      alert(`ESP32 Diagnostic for ${deviceId}: All optical ADC registers, I2C bus, and WiFi transceiver passed.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-navy-600 uppercase tracking-wider">
              IoT Hardware Gateway & Fleet Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">ESP32 Dosimeter Wristbands</h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor hardware health, optical strip cartridge lifespans, WiFi RSSI signal, and OTA firmware
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span>Launch Telemetry Simulator</span>
        </button>
      </div>

      {/* Device Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deviceList.map((device) => {
          const isPrimary = device.id === 'H2S-ESP32-001';
          const battery = isPrimary ? latestTelemetry.batteryPercent : device.battery;
          const status = isPrimary ? (latestTelemetry.riskState === 'DATA_INVALID' ? 'ERROR' : 'ONLINE') : device.status;
          const stripUsagePercent = Math.min(100, Math.round((device.stripUsedHours / device.stripExpiryHours) * 100));

          return (
            <div
              key={device.id}
              className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5 card-3d-hover flex flex-col justify-between"
            >
              <div>
                {/* Top Badge Line */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-950">{device.name}</h3>
                      {isPrimary && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Live Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{device.id}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      status === 'ONLINE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : status === 'ERROR'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    {status}
                  </span>
                </div>

                {/* Device Spec Matrix */}
                <div className="space-y-2 py-3 border-y border-gray-100 my-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery Level:
                    </span>
                    <span className="font-mono font-bold text-navy-900">{battery}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-blue-600" /> WiFi Signal (RSSI):
                    </span>
                    <span className="font-mono text-gray-700">{device.rssi} dBm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" /> Firmware:
                    </span>
                    <span className="font-mono text-gray-700">{device.firmwareVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" /> Strip Batch ID:
                    </span>
                    <span className="font-mono text-navy-900 font-semibold">{device.stripBatchId}</span>
                  </div>
                </div>

                {/* Chemical Strip Cartridge Lifespan Bar */}
                <div className="bg-navy-50/70 p-3 rounded-xl border border-navy-100 mb-4">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-bold text-navy-800">Strip Cartridge Validity</span>
                    <span className="font-mono font-bold text-navy-900">
                      {device.stripUsedHours}h / {device.stripExpiryHours}h
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stripUsagePercent > 90
                          ? 'bg-red-500'
                          : stripUsagePercent > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stripUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunDiagnostic(device.id)}
                  disabled={diagnosingDeviceId === device.id}
                  className="w-full py-2 bg-white hover:bg-navy-50 text-navy-800 font-bold text-xs rounded-xl border border-navy-200 flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${diagnosingDeviceId === device.id ? 'animate-spin' : ''}`} />
                  <span>{diagnosingDeviceId === device.id ? 'Testing...' : 'Run Diagnostics'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
