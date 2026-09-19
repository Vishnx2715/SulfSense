import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  Users,
  Radio,
  FileText,
  Sparkles,
  WifiOff,
  X,
  Smartphone,
} from 'lucide-react';
import { AlertItem, DosimeterDevice, SensorTelemetry, UserRole, Worker } from './types';
import { BASELINE_STRIP_RGB, rgbToLab, rgbToHsv } from './ml/colorProcessing';
import { globalSimulator, SimulatorControls } from './services/esp32Simulator';
import {
  getStoredWorkers,
  getStoredDevices,
  getStoredAlerts,
  saveAlerts,
  saveWorkers,
} from './services/storageService';
import { initPwaInstallListener, promptPwaInstall, registerServiceWorker } from './services/pwaService';
import { createAlertRecord, evaluateHazard } from './ml/hazardEngine';

// Components
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavigationTab } from './components/common/Sidebar';
import { AlertModal } from './components/alerts/AlertModal';
import { WorkerWearableSimulator } from './components/wearable/WorkerWearableSimulator';
import { Esp32SimulatorControls } from './features/devices/Esp32SimulatorControls';
import { WorkerDetailView } from './features/workers/WorkerDetailView';

// Views
import { SupervisorDashboard } from './features/dashboard/SupervisorDashboard';
import { LiveSensorMonitor } from './features/sensor/LiveSensorMonitor';
import { CalibrationStudio } from './features/ai/CalibrationStudio';
import { WorkerDirectory } from './features/workers/WorkerDirectory';
import { DeviceManager } from './features/devices/DeviceManager';
import { ExposureAnalytics } from './features/reports/ExposureAnalytics';
import { LandingPage } from './features/landing/LandingPage';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('supervisor');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  // Workforce & System Data
  const [workers, setWorkers] = useState<Worker[]>(getStoredWorkers);
  const [devices, setDevices] = useState<DosimeterDevice[]>(getStoredDevices);
  const [alerts, setAlerts] = useState<AlertItem[]>(getStoredAlerts);

  // Modals & Drawers
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState<boolean>(false);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<Worker | null>(null);

  // Simulator Controls
  const [simulatorControls, setSimulatorControls] = useState<SimulatorControls>(globalSimulator.getControls());

  // Initial Baseline Telemetry
  const [latestTelemetry, setLatestTelemetry] = useState<SensorTelemetry>(() => {
    const baseLab = rgbToLab(BASELINE_STRIP_RGB.r, BASELINE_STRIP_RGB.g, BASELINE_STRIP_RGB.b);
    const baseHsv = rgbToHsv(BASELINE_STRIP_RGB.r, BASELINE_STRIP_RGB.g, BASELINE_STRIP_RGB.b);
    return {
      deviceId: 'H2S-ESP32-001',
      workerId: 'W-101',
      timestamp: new Date().toISOString(),
      rawColor: BASELINE_STRIP_RGB,
      lab: baseLab,
      hsv: baseHsv,
      deltaE: 0,
      temperature: 26.5,
      humidity: 52.0,
      batteryPercent: 96,
      rssi: -58,
      estimatedDose: 0,
      doseUncertainty: 2.5,
      readingQuality: 'EXCELLENT',
      riskState: 'NORMAL',
      modelVersion: 'cal-v2.1',
      isSimulated: true,
    };
  });

  const [telemetryHistory, setTelemetryHistory] = useState<SensorTelemetry[]>([latestTelemetry]);

  // Register PWA & connectivity listeners
  useEffect(() => {
    registerServiceWorker();
    initPwaInstallListener((canInstall) => setIsInstallable(canInstall));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to ESP32 Telemetry Stream
  useEffect(() => {
    globalSimulator.start(1500);

    const unsubscribe = globalSimulator.subscribe((telemetry) => {
      setLatestTelemetry(telemetry);
      setTelemetryHistory((prev) => [...prev.slice(-35), telemetry]);

      // Update primary worker dose in roster
      setWorkers((prevWorkers) => {
        const updated = prevWorkers.map((w) =>
          w.id === 'W-101'
            ? {
                ...w,
                currentDose: telemetry.estimatedDose,
                riskState: telemetry.riskState,
                lastUpdate: telemetry.timestamp,
              }
            : w
        );
        saveWorkers(updated);
        return updated;
      });

      // Automatically trigger alert record if state is HAZARDOUS or WARNING and not recently created
      if (telemetry.riskState === 'HAZARDOUS' || telemetry.riskState === 'WARNING') {
        setAlerts((prevAlerts) => {
          const lastAlert = prevAlerts[0];
          const isRecent = lastAlert && Date.now() - new Date(lastAlert.timestamp).getTime() < 15000;
          if (!isRecent) {
            const hazard = evaluateHazard(telemetry.estimatedDose, telemetry.readingQuality);
            const newAlert = createAlertRecord(
              'W-101',
              'Alex Mercer',
              telemetry.deviceId,
              telemetry.estimatedDose,
              hazard,
              telemetry.riskState === 'HAZARDOUS' ? 200 : 100
            );
            const updated = [newAlert, ...prevAlerts];
            saveAlerts(updated);
            return updated;
          }
          return prevAlerts;
        });
      }
    });

    return () => {
      unsubscribe();
      globalSimulator.stop();
    };
  }, []);

  const handleUpdateSimulatorControls = (newControls: Partial<SimulatorControls>) => {
    globalSimulator.setManualControls(newControls);
    setSimulatorControls(globalSimulator.getControls());
  };

  const handleResetSimulation = () => {
    globalSimulator.resetSimulation();
    setSimulatorControls(globalSimulator.getControls());
  };

  const handleAcknowledgeAlert = (id: string) => {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a
    );
    setAlerts(updated);
    saveAlerts(updated);
  };

  const handleAcknowledgeAllAlerts = () => {
    const updated = alerts.map((a) => ({ ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() }));
    setAlerts(updated);
    saveAlerts(updated);
  };

  const handlePwaInstallClick = async () => {
    await promptPwaInstall();
  };

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-navy-950 flex flex-col selection:bg-navy-600 selection:text-white">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>OFFLINE MODE ACTIVE — Telemetry cached locally. Will sync when reconnected.</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        unreadAlertCount={unreadAlertsCount}
        onOpenAlerts={() => setIsAlertModalOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenWearableModal={() => setIsWearableModalOpen(true)}
        isInstallable={isInstallable}
        onInstallPwa={handlePwaInstallClick}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} alertCount={unreadAlertsCount} />

        {/* Dynamic Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* If current role is worker, show focused wearable view */}
          {currentRole === 'worker' ? (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-navy-sm">
                <h2 className="text-base font-bold text-navy-950 mb-1">Worker Personal Dosimeter View</h2>
                <p className="text-xs text-gray-500">
                  Worker: <strong>Alex Mercer (W-101)</strong> • Device: <strong>{latestTelemetry.deviceId}</strong>
                </p>
              </div>
              <WorkerWearableSimulator telemetry={latestTelemetry} />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <SupervisorDashboard
                  workers={workers}
                  devices={devices}
                  alerts={alerts}
                  latestTelemetry={latestTelemetry}
                  onOpenWorkerProfile={setSelectedWorkerProfile}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                />
              )}

              {activeTab === 'sensor-monitor' && (
                <LiveSensorMonitor telemetry={latestTelemetry} telemetryHistory={telemetryHistory} />
              )}

              {activeTab === 'calibration-studio' && <CalibrationStudio />}

              {activeTab === 'workers' && (
                <WorkerDirectory
                  workers={workers}
                  devices={devices}
                  latestTelemetry={latestTelemetry}
                  onSelectWorker={setSelectedWorkerProfile}
                />
              )}

              {activeTab === 'devices' && (
                <DeviceManager
                  devices={devices}
                  latestTelemetry={latestTelemetry}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                />
              )}

              {activeTab === 'reports' && (
                <ExposureAnalytics
                  workers={workers}
                  telemetryHistory={telemetryHistory}
                  latestTelemetry={latestTelemetry}
                />
              )}

              {activeTab === 'landing' && (
                <LandingPage
                  onEnterApp={() => setActiveTab('dashboard')}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-navy-100 px-2 py-1.5 flex justify-around items-center z-30 shadow-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'sensor-monitor', label: 'Telemetry', icon: Activity },
          { id: 'calibration-studio', label: 'AI Models', icon: Cpu },
          { id: 'workers', label: 'Workers', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavigationTab)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                isActive ? 'text-navy-900 font-extrabold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-navy-700' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals & Dialogs */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAllAlerts}
      />

      <Esp32SimulatorControls
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        controls={simulatorControls}
        onUpdateControls={handleUpdateSimulatorControls}
        onReset={handleResetSimulation}
      />

      <WorkerDetailView
        worker={selectedWorkerProfile}
        onClose={() => setSelectedWorkerProfile(null)}
        telemetryHistory={telemetryHistory}
        latestTelemetry={latestTelemetry}
      />

      {/* Wearable OLED Screen Modal */}
      {isWearableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-950 w-full max-w-md rounded-2xl border border-navy-700 p-6 shadow-navy-xl animate-slide-up relative">
            <button
              onClick={() => setIsWearableModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3">Live Wristband Wearable OLED</h3>
            <WorkerWearableSimulator telemetry={latestTelemetry} />
          </div>
        </div>
      )}
    </div>
  );
}
