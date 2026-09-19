import { CIELabColor, HSVColor, QualityState, RawColorData } from '../types';

// Standard baseline for fresh unreacted chemical strip under warm-white calibrated LED
export const BASELINE_STRIP_RGB: RawColorData = {
  r: 238,
  g: 228,
  b: 195,
  clear: 660,
};

/**
 * Converts sRGB (0-255) to CIE 1931 XYZ Color Space with D65 illuminant
 */
export function rgbToXyz(r: number, g: number, b: number) {
  let rLin = r / 255;
  let gLin = g / 255;
  let bLin = b / 255;

  rLin = rLin > 0.04045 ? Math.pow((rLin + 0.055) / 1.055, 2.4) : rLin / 12.92;
  gLin = gLin > 0.04045 ? Math.pow((gLin + 0.055) / 1.055, 2.4) : gLin / 12.92;
  bLin = bLin > 0.04045 ? Math.pow((bLin + 0.055) / 1.055, 2.4) : bLin / 12.92;

  rLin *= 100;
  gLin *= 100;
  bLin *= 100;

  const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
  const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
  const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;

  return { x, y, z };
}

/**
 * Converts XYZ to CIELAB Color Space
 */
export function xyzToLab(x: number, y: number, z: number): CIELabColor {
  // Reference white D65
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let xN = x / refX;
  let yN = y / refY;
  let zN = z / refZ;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + (16 / 116));

  const fx = f(xN);
  const fy = f(yN);
  const fz = f(zN);

  const L = Math.max(0, Math.min(100, (116 * fy) - 16));
  const a = (fx - fy) * 500;
  const b = (fy - fz) * 200;

  return {
    L: Number(L.toFixed(2)),
    a: Number(a.toFixed(2)),
    b: Number(b.toFixed(2)),
  };
}

/**
 * Direct sRGB to CIELAB helper
 */
export function rgbToLab(r: number, g: number, b: number): CIELabColor {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

/**
 * Converts sRGB (0-255) to HSV Color Space
 */
export function rgbToHsv(r: number, g: number, b: number): HSVColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

/**
 * Calculates CIE76 Color Difference (Delta E)
 * Delta E measures total perceptual color change from pristine state as H2S converts reagent into dark sulfide
 */
export function calculateDeltaE(lab1: CIELabColor, lab2: CIELabColor): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  const delta = Math.sqrt(dL * dL + da * da + db * db);
  return Number(delta.toFixed(2));
}

/**
 * Validates optical sensor signal quality and detects lens obstruction/saturation
 */
export function assessOpticalQuality(raw: RawColorData, temp: number): {
  quality: QualityState;
  reason?: string;
} {
  // Check for ADC optical saturation
  if (raw.r >= 254 || raw.g >= 254 || raw.b >= 254) {
    return { quality: 'INVALID', reason: 'Optical sensor saturated (ambient light leak)' };
  }

  // Check for severe optical obstruction (lens cover / zero photons)
  if (raw.r < 5 && raw.g < 5 && raw.b < 5) {
    return { quality: 'INVALID', reason: 'Optical channel blocked / LED emitter failure' };
  }

  // Check for extreme temperature drift
  if (temp > 60 || temp < -20) {
    return { quality: 'POOR', reason: 'Thermal sensor boundary exceeded' };
  }

  if (raw.clear < 50) {
    return { quality: 'POOR', reason: 'Low optical reflectance / lens smudge' };
  }

  if (raw.clear < 150) {
    return { quality: 'FAIR', reason: 'Suboptimal reflectance' };
  }

  return { quality: 'EXCELLENT' };
}

/**
 * Rolling Moving Average filter for 1D streams
 */
export class MovingAverageFilter {
  private windowSize: number;
  private values: number[] = [];

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  public filter(val: number): number {
    this.values.push(val);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
    const sum = this.values.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / this.values.length).toFixed(2));
  }
}
