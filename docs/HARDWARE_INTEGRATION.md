# SulfSense Hardware Integration Guide

## ESP32 Optical Colorimetric Wearable Specifications

### 1. Bill of Materials (BOM)
- **Microcontroller**: ESP32-WROOM-32E or ESP32-S3-Mini (with integrated WiFi & BLE 5.0)
- **Optical Color Sensor**: AMS AS7341 (11-channel spectral sensor) or Adafruit TCS34725 (RGB + Clear 16-bit ADC with integrated 4150K warm-white LED)
- **Environmental Sensor**: Sensirion SHT31-D (I2C Temperature & Relative Humidity)
- **Display**: 0.96-inch Monochrome I2C OLED (SSD1306, 128x64 pixels)
- **Acoustic Warning**: 3V Active Magnetic Piezo Buzzer (90dB at 10cm, 2.7kHz resonant frequency)
- **Haptic Actuator**: Precision Microdrives ERM Vibration Motor (1027 coin type)
- **Power Source**: 500mAh 3.7V Lithium Polymer Battery + TP4056 USB-C charging controller with MCP1700 3.3V LDO.

---

### 2. I2C Pinout & Wiring Map
| Component | ESP32 GPIO Pin | I2C Address | Function |
| :--- | :--- | :--- | :--- |
| **SDA** | GPIO 21 | - | Shared I2C Data Line |
| **SCL** | GPIO 22 | - | Shared I2C Clock Line |
| **TCS34725 Color Sensor** | - | `0x29` | Reflectance RGB + Clear Photons |
| **SHT31 Temp / RH** | - | `0x44` | Ambient $T(^\circ\text{C})$ & $RH(\%)$ |
| **SSD1306 OLED** | - | `0x3C` | 128x64 Monochrome Display |
| **Buzzer Control** | GPIO 18 | - | Active High Warning Tone |
| **Haptic Vibration** | GPIO 19 | - | PWM Tactile Alert |
| **Optical Illuminator LED**| GPIO 23 | - | Constant Current LED Emitter |
| **Battery ADC** | GPIO 34 | - | 1:2 Voltage Divider Input |

---

### 3. Telemetry Ingest Protocol (JSON over HTTPS)
```json
POST /api/readings
Content-Type: application/json

{
  "device_id": "H2S-ESP32-001",
  "worker_id": "W-101",
  "red": 215,
  "green": 195,
  "blue": 155,
  "clear": 580,
  "temperature": 27.4,
  "humidity": 54.2,
  "battery": 94,
  "rssi": -62
}
```

Response:
```json
{
  "estimated_dose": 35.2,
  "dose_unit": "ppm.min",
  "uncertainty": 4.5,
  "reading_quality": "EXCELLENT",
  "risk_state": "NORMAL",
  "delta_e": 14.5,
  "model_version": "cal-v2.1",
  "temperature_compensation_factor": 1.01
}
```
