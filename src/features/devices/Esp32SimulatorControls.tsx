import React from 'react';
import {
  Sliders,
  ShieldCheck,
  Flame,
  AlertOctagon,
  EyeOff,
  WifiOff,
  RotateCcw,
  Play,
  Pause,
  Thermometer,
  Droplets,
  Gauge,
  X,
  FastForward,
} from 'lucide-react';
import { SimulatorControls, SimulationScenario } from '../../services/esp32Simulator';

interface Esp32SimulatorControlsProps {
  isOpen: boolean;
  onClose: () => void;
  controls: SimulatorControls;
  onUpdateControls: (controls: Partial<SimulatorControls>) => void;
  onReset: () => void;
}

export const Esp32SimulatorControls: React.FC<Esp32SimulatorControlsProps> = ({
  isOpen,
  onClose,
  controls,
  onUpdateControls,
  onReset,
}) => {
  if (!isOpen) return null;

  const scenarios: Array<{
    id: SimulationScenario;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }> = [
    {
      id: 'NORMAL_SAFE',
      label: 'Safe Routine Shift',
      description: 'Trace background gas (<0.5 ppm), chemical strip remains pristine.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'GRADUAL_LEAK',
      label: 'Gradual Low Leak',
      description: 'Slow continuous leak (4.5 ppm). Progressive chemical strip darkening.',
      icon: Flame,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'HAZARDOUS_SURGE',
      label: 'Acute Hazardous Spike',
      description: 'High concentration breach (28 ppm). Fast reaction, triggers CRITICAL alarm.',
      icon: AlertOctagon,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'SENSOR_FAULT',
      label: 'Lens Smudge / Saturation',
      description: 'Optical saturation (R=255, G=255, B=255). Triggers DATA INVALID.',
      icon: EyeOff,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'OFFLINE_DISCONNECT',
      label: 'Device Disconnected',
      description: 'Simulates WiFi gateway packet drop and offline state.',
      icon: WifiOff,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-navy-100 shadow-navy-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ESP32 Hardware Simulation Engine</h2>
              <p className="text-xs text-navy-200">Inject realistic environmental & chemical telemetry</p>
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
          {/* Preset Scenarios Grid */}
          <div>
            <label className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-2.5">
              1. Select Simulation Scenario Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenarios.map((sc) => {
                const Icon = sc.icon;
                const isSelected = controls.scenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => onUpdateControls({ scenario: sc.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-navy-700 bg-navy-50/90 shadow-sm ring-2 ring-navy-600/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg border ${sc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-navy-900">{sc.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">{sc.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Telemetry Sliders */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
              2. Manual Environmental Tuning
            </label>

            {/* Ambient H2S Concentration Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-navy-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-600" />
                  Simulated Ambient Gas Concentration
                </span>
                <span className="font-mono font-bold text-navy-950">
                  {controls.gasConcentrationPpm.toFixed(1)} ppm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={controls.gasConcentrationPpm}
                onChange={(e) => onUpdateControls({ gasConcentrationPpm: parseFloat(e.target.value) })}
                className="w-full accent-navy-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0 ppm (Clean)</span>
                <span>10 ppm (OSHA Ceiling)</span>
                <span>50 ppm (Critical)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-navy-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-red-500" />
                  Ambient Temperature
                </span>
                <span className="font-mono font-bold text-navy-950">{controls.temperature.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="55"
                step="0.5"
                value={controls.temperature}
                onChange={(e) => onUpdateControls({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-navy-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-navy-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  Relative Humidity
                </span>
                <span className="font-mono font-bold text-navy-950">{controls.humidity.toFixed(1)} %RH</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={controls.humidity}
                onChange={(e) => onUpdateControls({ humidity: parseFloat(e.target.value) })}
                className="w-full accent-navy-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Time Multiplier and Controls */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <FastForward className="w-3.5 h-3.5 text-navy-600" /> Time Speed:
              </span>
              {[1, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateControls({ speedMultiplier: speed })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    controls.speedMultiplier === speed
                      ? 'bg-navy-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={() => onUpdateControls({ isPaused: !controls.isPaused })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                controls.isPaused ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {controls.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {controls.isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-navy-100 flex justify-between items-center">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Chemical Strip to 0
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-bold hover:bg-navy-900 shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
