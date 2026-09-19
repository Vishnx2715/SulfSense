# SulfSense Architectural Specification

## Passive Colorimetric H₂S Exposure-Dosimeter AI Quantitative Monitoring System

SulfSense is an industrial occupational health and safety solution engineered to detect and quantify cumulative hydrogen sulfide ($H_2S$) gas exposure.

---

## 1. Mathematical & Scientific Principle

Unlike conventional electronic gas sensors that measure instantaneous gas concentration ($C(t)$ in ppm), SulfSense measures **cumulative exposure dose**:

$$Dose(t) = \int_0^t C(t') \, dt' \quad [\text{unit: ppm}\cdot\text{min}]$$

### Chemical Reaction Kinetics
The wearable cartridge contains an immobilized reagent substrate (e.g. Lead Acetate or Silver nanoparticles) that undergoes irreversible chemical transformation upon diffusion of ambient $H_2S$ gas:

$$\text{Pb(CH}_3\text{COO)}_2\text{ (white/yellowish)} + \text{H}_2\text{S} \longrightarrow \text{PbS (dark brown/black precipitate)} + 2\text{CH}_3\text{COOH}$$

The rate of perceptual color change ($\Delta E$) is governed by Fickian passive diffusion and second-order binding kinetics:

$$\Delta E(t) = \Delta E_{\text{max}} \cdot \left(1 - \exp\left(-k \cdot Dose(t)\right)\right) \cdot f(T) \cdot f(RH)$$

Where:
- $\Delta E_{\text{max}} \approx 65.0$ (saturation threshold of optical strip)
- $k \approx 0.0028 \, (\text{ppm}\cdot\text{min})^{-1}$ (reaction rate constant)
- $f(T) = 1 + (T - 25^\circ\text{C}) \times 0.004$ (thermal diffusion compensation)
- $f(RH) = 1 + (RH - 50\%) \times 0.0025$ (moisture diffusion accelerant)

---

## 2. System Layer Separation

1. **Wearable Layer**: ESP32 microcontroller with TCS34725 / AS7341 16-bit optical color sensor, SHT31 temperature/humidity sensor, SSD1306 OLED display, active piezo buzzer, and haptic actuator.
2. **Signal Preprocessing Layer**: ADC spike suppression, 5-point rolling median filter, CIE 1931 XYZ to CIE-LAB D65 color space conversion, Delta-E Euclidean difference calculation.
3. **AI Calibration & Inversion Layer**: Inverts non-linear saturation kinetics into estimated cumulative dose ($ppm \cdot min$) and statistical prediction intervals ($\pm \sigma$).
4. **Hazard Assessment Layer**: Evaluates exposure criteria against configured project thresholds (NORMAL, CAUTION, WARNING, HAZARDOUS, DATA INVALID) without conflating raw math with safety actions.
5. **Supervisor PWA Layer**: Desktop and mobile progressive web application featuring real-time Three.js 3D wristband rendering, workforce safety roster, optical sensor monitor, calibration studio, and 1-click OSHA compliance audit reports.
