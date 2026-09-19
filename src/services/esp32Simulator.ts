import { BASELINE_STRIP_RGB, calculateDeltaE, rgbToHsv, rgbToLab } from '../ml/colorProcessing';
import { estimateCumulativeDose } from '../ml/doseModels';
import { evaluateHazard } from '../ml/hazardEngine';
import { RawColorData, SensorTelemetry } from '../types';

export type SimulationScenario =
  | 'NORMAL_SAFE'
  | 'GRADUAL_LEAK'
  | 'HAZARDOUS_SURGE'
  | 'SENSOR_FAULT'
  | 'OFFLINE_DISCONNECT';

export interface SimulatorControls {
  scenario: SimulationScenario;
  gasConcentrationPpm: number; // simulated ambient H2S gas level
  temperature: number; // ambient °C
  humidity: number; // ambient %RH
  speedMultiplier: number; // 1x, 2x, 5x, 10x
  isPaused: boolean;
}

const BASE_LAB = rgbToLab(BASELINE_STRIP_RGB.r, BASELINE_STRIP_RGB.g, BASELINE_STRIP_RGB.b);

export class Esp32DeviceSimulator {
  private deviceId: string;
  private workerId: string;
  private cumulativeDoseInternal: number = 0;
  private batteryLevel: number = 96;
  private elapsedSeconds: number = 0;
  private subscribers: Array<(telemetry: SensorTelemetry) => void> = [];
  private intervalTimer: number | null = null;
  private activeScenario: SimulationScenario = 'NORMAL_SAFE';
  private manualConcentrationPpm: number = 0.5;
  private manualTemp: number = 26.5;
  private manualHumidity: number = 52.0;
  private isPaused: boolean = false;
  private speedMultiplier: number = 1.0;

  constructor(deviceId: string = 'ESP32-H2S-001', workerId: string = 'W-101') {
    this.deviceId = deviceId;
    this.workerId = workerId;
  }

  public setScenario(scenario: SimulationScenario) {
    this.activeScenario = scenario;
    if (scenario === 'NORMAL_SAFE') {
      this.manualConcentrationPpm = 0.3;
    } else if (scenario === 'GRADUAL_LEAK') {
      this.manualConcentrationPpm = 4.5;
    } else if (scenario === 'HAZARDOUS_SURGE') {
      this.manualConcentrationPpm = 28.0;
    }
  }

  public setManualControls(controls: Partial<SimulatorControls>) {
    if (controls.scenario) this.setScenario(controls.scenario);
    if (controls.gasConcentrationPpm !== undefined) this.manualConcentrationPpm = controls.gasConcentrationPpm;
    if (controls.temperature !== undefined) this.manualTemp = controls.temperature;
    if (controls.humidity !== undefined) this.manualHumidity = controls.humidity;
    if (controls.speedMultiplier !== undefined) this.speedMultiplier = controls.speedMultiplier;
    if (controls.isPaused !== undefined) this.isPaused = controls.isPaused;
  }

  public getControls(): SimulatorControls {
    return {
      scenario: this.activeScenario,
      gasConcentrationPpm: this.manualConcentrationPpm,
      temperature: this.manualTemp,
      humidity: this.manualHumidity,
      speedMultiplier: this.speedMultiplier,
      isPaused: this.isPaused,
    };
  }

  public resetSimulation() {
    this.cumulativeDoseInternal = 0;
    this.elapsedSeconds = 0;
    this.batteryLevel = 98;
    this.activeScenario = 'NORMAL_SAFE';
    this.manualConcentrationPpm = 0.4;
  }

  public subscribe(callback: (telemetry: SensorTelemetry) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  public start(intervalMs: number = 1500) {
    if (this.intervalTimer !== null) return;

    this.intervalTimer = window.setInterval(() => {
      if (this.isPaused) return;
      this.tick();
    }, intervalMs);
  }

  public stop() {
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private tick() {
    this.elapsedSeconds += 1.5 * this.speedMultiplier;

    // Slowly discharge battery
    if (Math.random() < 0.05) {
      this.batteryLevel = Math.max(8, Number((this.batteryLevel - 0.1).toFixed(1)));
    }

    if (this.activeScenario === 'OFFLINE_DISCONNECT') {
      // Don't emit live data, or emit error state
      return;
    }

    // Accumulate dose based on scenario
    let currentPpm = this.manualConcentrationPpm;
    if (this.activeScenario === 'NORMAL_SAFE') {
      currentPpm = 0.2 + Math.sin(this.elapsedSeconds * 0.05) * 0.15;
    } else if (this.activeScenario === 'GRADUAL_LEAK') {
      currentPpm = 2.0 + Math.min(12.0, (this.elapsedSeconds / 30) * 1.5);
    } else if (this.activeScenario === 'HAZARDOUS_SURGE') {
      currentPpm = 15.0 + (this.elapsedSeconds / 10) * 6.0;
    }

    // Dose = Concentration * timeInMinutes
    const addedDose = (currentPpm * (1.5 * this.speedMultiplier)) / 60.0;
    this.cumulativeDoseInternal += addedDose;

    // Generate sensor reading corresponding to this cumulative dose
    let rawColor: RawColorData;

    if (this.activeScenario === 'SENSOR_FAULT') {
      // Simulate lens saturation or optical sensor disconnect
      rawColor = {
        r: 255,
        g: 255,
        b: 255,
        clear: 980,
      };
    } else {
      // Colorimetric conversion curve:
      // Darkening fraction:
      const k = 0.0028;
      const eMax = 65.0;
      const targetDeltaE = Math.min(eMax, eMax * (1 - Math.exp(-k * this.cumulativeDoseInternal)));
      const darkeningFactor = Math.min(1.0, targetDeltaE / eMax);

      // Raw RGB with slight electronic ADC noise (+- 1-2 counts)
      const noise = () => Math.round((Math.random() - 0.5) * 2.5);
      const r = Math.max(10, Math.round(BASELINE_STRIP_RGB.r - darkeningFactor * 185 + noise()));
      const g = Math.max(8, Math.round(BASELINE_STRIP_RGB.g - darkeningFactor * 188 + noise()));
      const b = Math.max(6, Math.round(BASELINE_STRIP_RGB.b - darkeningFactor * 165 + noise()));
      const clear = Math.max(40, Math.round(BASELINE_STRIP_RGB.clear - darkeningFactor * 520 + noise() * 2));

      rawColor = { r, g, b, clear };
    }

    const currentLab = rgbToLab(rawColor.r, rawColor.g, rawColor.b);
    const hsv = rgbToHsv(rawColor.r, rawColor.g, rawColor.b);
    const deltaE = calculateDeltaE(BASE_LAB, currentLab);

    // AI Dose Estimation
    const doseResult = estimateCumulativeDose(rawColor, this.manualTemp, this.manualHumidity);
    const hazard = evaluateHazard(doseResult.estimatedDose, doseResult.readingQuality);

    const telemetry: SensorTelemetry = {
      deviceId: this.deviceId,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
      rawColor,
      lab: currentLab,
      hsv,
      deltaE,
      temperature: Number((this.manualTemp + (Math.random() - 0.5) * 0.4).toFixed(1)),
      humidity: Number((this.manualHumidity + (Math.random() - 0.5) * 0.8).toFixed(1)),
      batteryPercent: Math.round(this.batteryLevel),
      rssi: -58 + Math.round((Math.random() - 0.5) * 6),
      estimatedDose: doseResult.estimatedDose,
      doseUncertainty: doseResult.doseUncertainty,
      readingQuality: doseResult.readingQuality,
      riskState: hazard.riskState,
      modelVersion: doseResult.modelVersion,
      isSimulated: true,
    };

    this.subscribers.forEach((cb) => cb(telemetry));
  }
}

// Global singleton simulator instance for the primary worker
export const globalSimulator = new Esp32DeviceSimulator('H2S-ESP32-001', 'W-101');
