import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, Clock, User, Radio } from 'lucide-react';
import { AlertItem, AlertPriority } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onAcknowledgeAll,
}) => {
  if (!isOpen) return null;

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-navy-100 shadow-navy-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Industrial Safety Alert Center</h2>
              <p className="text-xs text-navy-200">
                {unacknowledgedCount} unacknowledged exposure / device incident{unacknowledgedCount !== 1 ? 's' : ''}
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

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-navy-50/70 border-b border-navy-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-navy-800">Alert Audit Log</span>
          {unacknowledgedCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="font-bold text-navy-600 hover:text-navy-900 flex items-center gap-1.5 underline"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge All Incidents
            </button>
          )}
        </div>

        {/* Alert List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-navy-900">All Industrial Zones Clear</p>
              <p className="text-xs text-gray-500">No active exposure warnings recorded in this shift.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-gray-50/70 border-gray-200 opacity-75'
                    : alert.priority === 'CRITICAL'
                    ? 'bg-red-50/60 border-red-300 shadow-sm'
                    : 'bg-amber-50/50 border-amber-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <RiskBadge state={alert.riskState} size="sm" />
                    <span className="text-xs font-mono font-bold text-navy-900">
                      {alert.doseValue > 0 ? `${alert.doseValue.toFixed(1)} ppm·min` : 'FAULT'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs font-medium text-navy-900 mb-3">{alert.message}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-2 border-t border-navy-100/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-navy-500" />
                      {alert.workerName} ({alert.workerId})
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Radio className="w-3 h-3 text-navy-500" />
                      {alert.deviceId}
                    </span>
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-navy-800 text-white hover:bg-navy-900 transition-all shadow-sm"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-navy-100 flex justify-between items-center text-xs text-gray-500">
          <span>Safety Standard: OSHA 29 CFR 1910.1000 / ACGIH TLV-TWA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
