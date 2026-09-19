# SulfSense — Passive Colorimetric H₂S Exposure-Dosimeter AI Monitoring PWA

<div align="center">
  <h3>Smart India Hackathon (SIH) 2026 Innovation</h3>
  <p><strong>Wearable Passive Chemical Colorimetric Dosimeter with Real-Time ESP32 Telemetry & AI Quantitative Cumulative Dose Estimation</strong></p>
</div>

---

## 🔬 Core Operating Concept

```
PASSIVE H₂S CHEMICAL STRIP
         ↓ (Progressive Color Change / Precipitate)
   COLOR SENSOR (TCS34725 / AS7341)
         ↓ (16-bit RGB & Clear Channels)
      ESP32 (IoT Telemetry Gateway)
         ↓ (WiFi / HTTPS / WebSockets)
CALIBRATION & PREPROCESSING (CIE-LAB ΔE + Temp/RH Matrix)
         ↓
AI DOSE ESTIMATION ENGINE (Non-Linear Kinetic Inversion)
         ↓ (Cumulative Dose in ppm·min ± Uncertainty)
  HAZARD ASSESSMENT ENGINE
         ↓
WORKER WEARABLE ALERT (OLED Display + Acoustic Buzzer + Vibration)
         ↓
SUPERVISOR REAL-TIME SAFETY DASHBOARD (PWA + 3D Wristband + Shift Audit Reports)
```

---

## ✨ Key Features & Architecture

1. **3D Interactive Wearable Model (Three.js)**:
   - Dynamic real-time chemical strip color degradation animation (pristine ivory reagent shifting to dark lead/silver sulfide precipitate).
   - Optical sensing ray, status LED, OLED glass, and 3D hover physics.
2. **AI-Assisted Quantitative Dose Estimation**:
   - Computes cumulative exposure dose: $Dose(t) = \int C(t) dt \quad [\text{ppm}\cdot\text{min}]$.
   - Validated models: Multi-Feature Random Forest (`cal-v2.1`), 3rd-Degree Polynomial Kinetics (`cal-v1.4`), Multivariate Ridge with Temperature & Moisture Compensation.
   - Transparent prediction intervals ($\pm \sigma$) and explainability feature weights.
3. **ESP32 Hardware Simulation Engine**:
   - 5 pre-configured industrial simulation scenarios: Safe routine shift, Gradual low-level leak, Acute hazardous spike (28 ppm breach), Optical sensor smudge/saturation fault, Device disconnect.
   - Manual sliders for ambient gas concentration ($ppm$), temperature ($^\circ C$), humidity ($\%RH$), and time speed (1x to 10x).
4. **Industrial Supervisor Dashboard**:
   - Real-time workforce exposure roster, configurable safety thresholds (NORMAL, CAUTION, WARNING, HAZARDOUS, DATA INVALID), sparklines, and drilldown worker profile modal.
5. **Worker Wearable OLED Screen Simulator**:
   - High-contrast OLED display with live synthesized acoustic piezo buzzer (Web Audio API) and haptic tactile vibration indicators.
6. **Shift Exposure Analytics & Formal Safety Certificates**:
   - 1-Click CSV dataset export and printable ISO/OSHA compliant safety audit report.
7. **PWA & Offline Resiliency**:
   - Installable Web App Manifest, Service Worker offline caching, standalone display mode.
8. **Crisp Navy Blue & White Light Theme**:
   - High contrast industrial safety palette (`#0F1E36`, `#15336E`, `#2A5EB3`, `#FFFFFF`) with micro-animations and smooth scroll transitions.

---

## 🚀 Quick Start & Local Execution

### 1. Frontend PWA Setup
```bash
# In the root directory (d:/SIH 2026/SULFSENSE)
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to launch the full interactive PWA with built-in ESP32 simulation!

### 2. Building for Production
```bash
npm run build
npm run preview
```

### 3. Backend API Setup (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📁 Repository Structure

```
├── public/
│   ├── favicon.svg             # SulfSense SVG logo & app icon
│   ├── manifest.json           # PWA Web App Manifest
│   └── sw.js                   # Service Worker for offline caching
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── DosimeterWristband3D.tsx    # Three.js 3D wearable model
│   │   │   └── ChemicalStripVisualizer.tsx # Microstructure color scale
│   │   ├── wearable/
│   │   │   └── WorkerWearableSimulator.tsx # OLED screen + acoustic buzzer
│   │   ├── common/
│   │   │   ├── Navbar.tsx      # Top bar with role switcher & PWA install
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── StatCard.tsx    # 3D hover KPI cards
│   │   │   └── RiskBadge.tsx   # Multi-channel risk badges
│   │   └── alerts/
│   │       └── AlertModal.tsx  # Safety incident audit log
│   ├── features/
│   │   ├── dashboard/          # Supervisor dashboard & live roster
│   │   ├── sensor/             # Live optical RGB/LAB telemetry charts
│   │   ├── ai/                 # Calibration Studio & model training
│   │   ├── workers/            # Workforce directory & profile timeline
│   │   ├── devices/            # ESP32 fleet manager & simulation drawer
│   │   ├── reports/            # Shift analytics & printable PDF certificate
│   │   └── landing/            # Project overview & architectural pipeline
│   ├── ml/
│   │   ├── colorProcessing.ts  # CIE-LAB conversion, Delta-E, filter
│   │   ├── doseModels.ts       # Non-linear dose estimation & uncertainty
│   │   ├── calibrationDatasets.ts # NIST gas chamber training points
│   │   └── hazardEngine.ts     # Safety decision & OSHA criteria
│   ├── services/
│   │   ├── esp32Simulator.ts   # Hardware telemetry simulation engine
│   │   ├── storageService.ts   # Local persistence
│   │   ├── exportService.ts    # CSV & PDF export
│   │   └── pwaService.ts       # PWA registration
│   ├── types/                  # TypeScript domain types
│   ├── App.tsx                 # Top-level application container
│   ├── main.tsx                # React root
│   └── index.css               # Tailwind & glassmorphism styling
├── backend/
│   ├── main.py                 # FastAPI REST & WebSocket endpoints
│   ├── ml_engine.py            # Python ML estimation engine
│   ├── schemas.py              # Pydantic data schemas
│   ├── database.py             # SQLAlchemy models
│   └── requirements.txt        # Backend dependencies
├── firmware/
│   ├── esp32_sulfsense.ino     # ESP32 C++ Arduino firmware
│   └── README.md
└── docs/
    ├── ARCHITECTURE.md         # Scientific kinetics & layer separation
    ├── HARDWARE_INTEGRATION.md # Sensor BOM, pinouts, and JSON spec
    └── API_SPEC.md             # REST API endpoint definitions
```

---

## ⚖️ Safety & Regulatory Standards

- **OSHA 29 CFR 1910.1000 Table Z-2**: 8-Hour Time-Weighted Average (10 ppm) & Peak Ceiling Limit.
- **ACGIH TLV-TWA**: 1 ppm Threshold Limit Value.
- **Scientific Methodology Notice**: All dose values generated represent **estimated cumulative exposure ($ppm \cdot min$)** derived from calibrated optical response and validated statistical prediction intervals ($\pm \sigma$).
