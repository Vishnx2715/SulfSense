import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Clock,
  Radio,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
} from 'lucide-react';
import { Worker, DosimeterDevice, SensorTelemetry } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';

interface WorkerDirectoryProps {
  workers: Worker[];
  devices: DosimeterDevice[];
  latestTelemetry: SensorTelemetry;
  onSelectWorker: (worker: Worker) => void;
}

export const WorkerDirectory: React.FC<WorkerDirectoryProps> = ({
  workers,
  devices,
  latestTelemetry,
  onSelectWorker,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = ['ALL', ...Array.from(new Set(workers.map((w) => w.department)))];

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || w.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-navy-600 uppercase tracking-wider">
              Plant Personnel Directory & Wearable Assignment
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">Active Workforce Roster</h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor worker shift dosimeter badges, assigned wristband IDs, and cumulative shift exposure
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by worker name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-navy-50/60 border border-navy-100 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-600/30 w-60"
            />
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDept === dept
                ? 'bg-navy-800 text-white shadow-sm'
                : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorkers.map((worker) => {
          const dose = worker.id === 'W-101' ? latestTelemetry.estimatedDose : worker.currentDose;
          const risk = worker.id === 'W-101' ? latestTelemetry.riskState : worker.riskState;
          const assignedDevice = devices.find((d) => d.id === worker.assignedDeviceId);

          return (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5 card-3d-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-white font-bold flex items-center justify-center text-sm shadow-sm border border-navy-600">
                      {worker.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-950">{worker.name}</h3>
                      <span className="text-[11px] font-mono text-gray-500">
                        {worker.employeeCode} • {worker.id}
                      </span>
                    </div>
                  </div>
                  <RiskBadge state={risk} size="sm" />
                </div>

                <div className="space-y-2 py-3 border-y border-gray-100 my-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span className="font-semibold text-navy-900 text-right">{worker.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="text-gray-700 text-right">{worker.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shift:</span>
                    <span className="text-gray-700">{worker.shift}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Wearable Device:</span>
                    <span className="font-mono text-navy-700 font-semibold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-navy-500" />
                      {worker.assignedDeviceId || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Dose Gauge */}
                <div className="bg-navy-50/70 p-3 rounded-xl border border-navy-100 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-navy-800">Cumulative H₂S Dose</span>
                    <span className="text-xs font-mono font-extrabold text-navy-950">
                      {dose.toFixed(1)} ppm·min
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        risk === 'HAZARDOUS'
                          ? 'bg-red-600'
                          : risk === 'WARNING'
                          ? 'bg-amber-500'
                          : risk === 'CAUTION'
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (dose / 200) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectWorker(worker)}
                className="w-full py-2 bg-navy-50 hover:bg-navy-100 text-navy-800 font-bold text-xs rounded-xl border border-navy-200 flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>View Full Exposure Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
