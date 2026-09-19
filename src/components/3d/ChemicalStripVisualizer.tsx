import React from 'react';
import { ShieldAlert, Info, Sparkles, Layers, Activity } from 'lucide-react';
import { CIELabColor, RawColorData } from '../../types';

interface ChemicalStripVisualizerProps {
  rawColor: RawColorData;
  lab: CIELabColor;
  deltaE: number;
  estimatedDose: number;
}

export const ChemicalStripVisualizer: React.FC<ChemicalStripVisualizerProps> = ({
  rawColor,
  lab,
  deltaE,
  estimatedDose,
}) => {
  // Reaction progression percentage (0 - 100%)
  const saturationPercent = Math.min(100, Math.round((deltaE / 65) * 100));

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5 card-3d-hover transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Colorimetric Reaction Kinetics</h3>
            <p className="text-xs text-gray-500">Immobilized Reagent Membrane (Pb2+/Ag+ + H2S &rarr; Sulfide Precipitate)</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-navy-50 text-navy-700 border border-navy-100">
          Reaction Extent: {saturationPercent}%
        </span>
      </div>

      {/* Visualizer Membrane Cross-Section */}
      <div className="relative h-20 rounded-xl overflow-hidden border border-navy-200 shadow-inner mb-4 flex items-center justify-center">
        {/* Active color swatch with texture */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: `rgb(${rawColor.r}, ${rawColor.g}, ${rawColor.b})` }}
        />
        {/* Microscopic texture overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Center badge */}
        <div className="relative z-10 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-navy-100 flex items-center gap-3 text-xs font-mono text-navy-900">
          <span className="font-bold">ΔE: {deltaE.toFixed(1)}</span>
          <span className="text-gray-300">|</span>
          <span>L*={lab.L.toFixed(1)}</span>
          <span>a*={lab.a.toFixed(1)}</span>
          <span>b*={lab.b.toFixed(1)}</span>
        </div>
      </div>

      {/* Progression Scale Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[11px] font-medium text-gray-600">
          <span>Pristine Strip (0 ppm·min)</span>
          <span>Caution (40 ppm·min)</span>
          <span>Warning (100 ppm·min)</span>
          <span>Hazard Saturated (200+ ppm·min)</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
          {/* Reaction gradient */}
          <div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(to right, #FBF8EE 0%, #D8C387 20%, #8A6E3C 50%, #3B2E1C 80%, #17130F 100%)',
            }}
          />
          {/* Current position marker */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-navy-900 border-2 border-white rounded-full shadow-md transition-all duration-300 -translate-x-1"
            style={{ left: `${Math.min(100, Math.max(0, (estimatedDose / 220) * 100))}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-navy-50/50 rounded-xl p-3 border border-navy-100">
        <div>
          <span className="text-gray-500 block text-[11px]">Principle:</span>
          <span className="font-semibold text-navy-800">Passive Molecular Diffusion</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[11px]">Interference Mitigation:</span>
          <span className="font-semibold text-navy-800">Temp & RH Calibrated Matrix</span>
        </div>
      </div>
    </div>
  );
};
