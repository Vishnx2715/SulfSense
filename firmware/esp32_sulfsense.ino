/**
 * SulfSense — Wearable Passive Colorimetric H2S Dosimeter Firmware
 * Target Microcontroller: ESP32 / ESP32-S3 (Wearable Edition)
 * Sensors: TCS34725 RGB Color Sensor, SHT31 Temp/RH, SSD1306 0.96" OLED, Active Buzzer
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_TCS34725.h>
#include <Adafruit_SHT31.h>
#include <ArduinoJson.h>

// --- Configuration & Constants ---
const char* WIFI_SSID = "SulfSense_Industrial_Net";
const char* WIFI_PASS = "SafetyFirst2026";
const char* SERVER_ENDPOINT = "https://api.sulfsense.safety/api/readings";

#define DEVICE_ID "H2S-ESP32-001"
#define WORKER_ID "W-101"

// Hardware Pinout Definitions
#define PIN_BUZZER 18
#define PIN_HAPTIC 19
#define PIN_BATTERY_ADC 34
#define PIN_OPTICAL_LED 23

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// Telemetry State
float currentEstimatedDose = 0.0;
String currentRiskState = "NORMAL";
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL_MS = 1500;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_HAPTIC, OUTPUT);
  pinMode(PIN_OPTICAL_LED, OUTPUT);
  digitalWrite(PIN_OPTICAL_LED, HIGH); // Turn on calibrated optical illuminator

  Wire.begin(21, 22);

  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println("SULFSENSE v1.0");
  display.println("Initializing sensors...");
  display.display();

  // Initialize Optical TCS34725
  if (!tcs.begin()) {
    Serial.println("No TCS34725 color sensor found ... check I2C wiring!");
  }

  // Initialize Temp/RH SHT31
  if (!sht31.begin(0x44)) {
    Serial.println("Couldn't find SHT31 sensor");
  }

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println("\nWiFi Online!");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = now;

    // 1. Read Raw Optical Channels
    uint16_t r, g, b, c;
    tcs.getRawData(&r, &g, &b, &c);

    // Normalize to 8-bit scale
    uint8_t red8 = map(r, 0, 4096, 0, 255);
    uint8_t green8 = map(g, 0, 4096, 0, 255);
    uint8_t blue8 = map(b, 0, 4096, 0, 255);

    // 2. Read Ambient Temp & RH
    float t = sht31.readTemperature();
    float h = sht31.readHumidity();
    if (isnan(t)) t = 25.0;
    if (isnan(h)) h = 50.0;

    // 3. Read Battery Voltage
    int rawAdc = analogRead(PIN_BATTERY_ADC);
    int batteryPercent = map(rawAdc, 2800, 4095, 0, 100);
    batteryPercent = constrain(batteryPercent, 0, 100);

    // 4. Update OLED Display
    updateOledDisplay(currentEstimatedDose, currentRiskState, t, h, batteryPercent);

    // 5. Transmit Telemetry over WiFi
    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetryPayload(red8, green8, blue8, c, t, h, batteryPercent);
    }

    // 6. Local Wearable Alarm Checks
    if (currentRiskState == "HAZARDOUS") {
      digitalWrite(PIN_BUZZER, HIGH);
      digitalWrite(PIN_HAPTIC, HIGH);
      delay(200);
      digitalWrite(PIN_BUZZER, LOW);
      digitalWrite(PIN_HAPTIC, LOW);
    } else if (currentRiskState == "WARNING") {
      digitalWrite(PIN_BUZZER, HIGH);
      delay(80);
      digitalWrite(PIN_BUZZER, LOW);
    }
  }
}

void updateOledDisplay(float dose, String risk, float temp, float rh, int battery) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(DEVICE_ID);
  display.setCursor(85, 0);
  display.print(battery);
  display.println("%");

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 14);
  display.setTextSize(1);
  display.println("ESTIMATED DOSE:");

  display.setCursor(0, 26);
  display.setTextSize(2);
  display.print(dose, 1);
  display.setTextSize(1);
  display.print(" ppm.m");

  display.setCursor(0, 48);
  display.print("STATE: ");
  display.println(risk);

  display.display();
}

void sendTelemetryPayload(uint8_t r, uint8_t g, uint8_t b, uint16_t clear, float t, float h, int bat) {
  HTTPClient http;
  http.begin(SERVER_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<300> doc;
  doc["device_id"] = DEVICE_ID;
  doc["worker_id"] = WORKER_ID;
  doc["red"] = r;
  doc["green"] = g;
  doc["blue"] = b;
  doc["clear"] = clear;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["battery"] = bat;
  doc["rssi"] = WiFi.RSSI();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    String response = http.getString();
    StaticJsonDocument<300> respDoc;
    deserializeJson(respDoc, response);
    if (respDoc.containsKey("estimated_dose")) {
      currentEstimatedDose = respDoc["estimated_dose"];
      currentRiskState = respDoc["risk_state"].as<String>();
    }
  }
  http.end();
}
