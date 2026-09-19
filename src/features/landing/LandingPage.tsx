import React from 'react';
import {
  Shield,
  Layers,
  Activity,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Radio,
  Sparkles,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { DosimeterWristband3D } from '../../components/3d/DosimeterWristband3D';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenSimulator: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenSimulator }) => {
  return (
    <div className="space-y-12 animate-fade-in py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white p-8 md:p-12 border border-navy-700 shadow-navy-xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Text (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Smart India Hackathon 2026 Innovation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Passive Colorimetric H₂S Exposure Dosimeter
            </h1>

            <p className="text-sm sm:text-base text-navy-200 leading-relaxed max-w-xl">
              A next-generation industrial wearable monitoring system. Transforms passive chemical reagent color degradation into <strong>calibrated cumulative H₂S exposure dose ($ppm \cdot min$)</strong> using optical color sensors, ESP32 telemetry, and quantitative AI regression.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-all text-sm group"
              >
                <span>Open Live Supervisor Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onOpenSimulator}
                className="flex items-center gap-2 px-5 py-3 bg-navy-800 hover:bg-navy-700 text-white font-bold rounded-xl border border-navy-600 transition-all text-sm"
              >
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Simulate Gas Exposure</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Model Hero (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
              <DosimeterWristband3D
                rawColor={{ r: 215, g: 195, b: 155, clear: 580 }}
                deltaE={14.5}
                estimatedDose={35.2}
                riskState="NORMAL"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Core Architectural Pipeline Section */}
      <div className="bg-white rounded-3xl border border-navy-100 shadow-navy-sm p-8 md:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-navy-600 uppercase tracking-widest block mb-1">
            System Operating Principle
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950">
            End-to-End Scientific Architecture
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Eliminating false alarms and electrochemical sensor drift through validated passive reagent kinetics
          </p>
        </div>

        {/* 6-Step Visual Process Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                01
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">Passive Chemical Strip</h3>
              <p className="text-[11px] text-gray-500">Immobilized reagent binds specifically with ambient H₂S molecules.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                02
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">Color Change</h3>
              <p className="text-[11px] text-gray-500">Progressive darkening into metal sulfide precipitate.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                03
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">Optical Sensor</h3>
              <p className="text-[11px] text-gray-500">TCS34725 samples reflectance at 16-bit resolution.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                04
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">ESP32 Gateway</h3>
              <p className="text-[11px] text-gray-500">Telemetry packetization with Temp, Humidity & WiFi RSSI.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                05
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">AI Dose Estimator</h3>
              <p className="text-[11px] text-gray-500">Non-linear kinetic regression yields cumulative dose in ppm·min.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-navy-800 text-white font-mono font-bold text-xs flex items-center justify-center mb-3">
                06
              </span>
              <h3 className="text-xs font-bold text-navy-950 mb-1">Hazard Alert</h3>
              <p className="text-[11px] text-gray-500">Triggers wristband buzzer/haptics + central safety dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Value Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-navy-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-950">True Cumulative Exposure</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Measures the integrated dose ($\int C(t) dt$) over the full 8-hour shift, preventing chronic occupational poisoning.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-navy-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-950">Environmental Compensation</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Incorporates real-time ambient temperature and moisture diffusion matrices to ensure calibrated quantitative precision.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-navy-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-950">Regulatory Compliance Ready</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            One-click audit reports generated in compliance with OSHA 29 CFR 1910.1000 and ACGIH TLV-TWA safety standards.
          </p>
        </div>
      </div>
    </div>
  );
};
