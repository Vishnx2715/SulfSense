import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Vibrate, Battery, Wifi, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { RiskState, SensorTelemetry } from '../../types';

interface WorkerWearableSimulatorProps {
  telemetry: SensorTelemetry;
}

export const WorkerWearableSimulator: React.FC<WorkerWearableSimulatorProps> = ({ telemetry }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Play synthesized acoustic warning tone when in hazardous/warning state
  const playBuzzerBeep = (freq: number = 880, duration: number = 0.2) => {
    if (!isAudioEnabled) return;
    try {
      const ctx = audioContext || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  };

  useEffect(() => {
    if (telemetry.riskState === 'HAZARDOUS') {
      playBuzzerBeep(1200, 0.35);
    } else if (telemetry.riskState === 'WARNING') {
      playBuzzerBeep(750, 0.2);
    }
  }, [telemetry.riskState, telemetry.estimatedDose]);

  const isAlarming = telemetry.riskState === 'HAZARDOUS' || telemetry.riskState === 'WARNING';

  return (
    <div className="bg-gradient-to-b from-navy-900 to-navy-950 text-white rounded-2xl border border-navy-700 shadow-navy-lg p-5 relative overflow-hidden">
      {/* Decorative Bezel Frame */}
      <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-navy-200">
            SULFSENSE WEARABLE OLED (ESP32-S3)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isAudioEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-navy-800 text-gray-400'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {isAudioEnabled ? 'Buzzer Armed' : 'Buzzer Muted'}
          </button>
        </div>
      </div>

      {/* Simulated High-Contrast Monochrome OLED Watch Screen */}
      <div
        className={`bg-black rounded-xl p-5 border-2 transition-all font-mono relative overflow-hidden ${
          telemetry.riskState === 'HAZARDOUS'
            ? 'border-red-500 shadow-glow-danger animate-bounce'
            : telemetry.riskState === 'WARNING'
            ? 'border-amber-500'
            : 'border-navy-800'
        }`}
      >
        {/* OLED Top Bar */}
        <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-800 pb-2 mb-3">
          <span className="flex items-center gap-1 text-white">
            <Zap className="w-3 h-3 text-cyan-400" />
            {telemetry.deviceId}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              {telemetry.rssi} dBm
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Battery className="w-3 h-3" />
              {telemetry.batteryPercent}%
            </span>
          </div>
        </div>

        {/* OLED Main Dose Readout */}
        <div className="text-center py-2">
          <span className="text-[10px] tracking-widest text-cyan-400/90 uppercase block font-semibold mb-1">
            ESTIMATED CUMULATIVE DOSE
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-4xl font-extrabold tracking-tight ${
                telemetry.riskState === 'HAZARDOUS'
                  ? 'text-red-400 animate-pulse'
                  : telemetry.riskState === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {telemetry.estimatedDose.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 font-sans">ppm·min</span>
          </div>
          <span className="text-[11px] text-gray-400 block mt-1">
            Uncertainty: ±{telemetry.doseUncertainty.toFixed(1)} ppm·min
          </span>
        </div>

        {/* Local Risk Alert Strip */}
        <div
          className={`mt-3 py-2 px-3 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-2 ${
            telemetry.riskState === 'HAZARDOUS'
              ? 'bg-red-950/80 text-red-300 border border-red-500'
              : telemetry.riskState === 'WARNING'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500'
              : telemetry.riskState === 'CAUTION'
              ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/50'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {isAlarming ? <AlertTriangle className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          STATE: {telemetry.riskState}
        </div>

        {/* Bottom Sensor Telemetry Line */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-900">
          <span>T: {telemetry.temperature}°C</span>
          <span>RH: {telemetry.humidity}%</span>
          <span>Q: {telemetry.readingQuality}</span>
        </div>
      </div>

      {/* Hardware Haptic Indicator */}
      <div className="flex items-center justify-between text-xs text-navy-300 mt-3 px-1">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Vibrate className={`w-3.5 h-3.5 ${isAlarming ? 'text-amber-400 animate-spin' : 'text-gray-500'}`} />
          Haptic Actuator: {isAlarming ? 'PULSING (300ms)' : 'STANDBY'}
        </span>
        <span className="text-[11px] font-mono text-navy-400">Worker ID: {telemetry.workerId}</span>
      </div>
    </div>
  );
};
