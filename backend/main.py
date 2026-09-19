from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime
import asyncio
import json

from schemas import (
    SensorIngestPayload,
    DoseEstimationRequest,
    DoseEstimationResponse,
    WorkerSummary,
    SafetyAlertPayload
)
from ml_engine import ml_engine, calculate_delta_e

app = FastAPI(
    title="SulfSense API",
    description="Backend API for Passive Colorimetric H2S Exposure-Dosimeter AI Monitoring System",
    version="1.0.0"
)

# Enable CORS for Frontend PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory active workers and alerts store for demo/standalone operation
workers_db: List[Dict[str, Any]] = [
    {
        "id": "W-101",
        "name": "Alex Mercer",
        "employee_code": "EMP-7402",
        "role": "Lead Desulfurization Technician",
        "department": "Claus Sulfur Recovery Unit #2",
        "assigned_device_id": "H2S-ESP32-001",
        "shift": "Shift Alpha (06:00 - 14:00)",
        "current_dose": 14.2,
        "risk_state": "NORMAL",
        "status": "ACTIVE"
    },
    {
        "id": "W-102",
        "name": "Elena Rostova",
        "employee_code": "EMP-8819",
        "role": "Field Inspection Engineer",
        "department": "Hydrotreater Flare Header Zone",
        "assigned_device_id": "H2S-ESP32-002",
        "shift": "Shift Alpha (06:00 - 14:00)",
        "current_dose": 72.8,
        "risk_state": "CAUTION",
        "status": "ACTIVE"
    },
    {
        "id": "W-103",
        "name": "Marcus Vance",
        "employee_code": "EMP-6190",
        "role": "Sour Gas Pipeline Operator",
        "department": "Wellhead Gathering Station B",
        "assigned_device_id": "H2S-ESP32-003",
        "shift": "Shift Alpha (06:00 - 14:00)",
        "current_dose": 134.5,
        "risk_state": "WARNING",
        "status": "ACTIVE"
    }
]

alerts_db: List[Dict[str, Any]] = [
    {
        "id": "ALT-1001",
        "worker_id": "W-103",
        "worker_name": "Marcus Vance",
        "device_id": "H2S-ESP32-003",
        "timestamp": datetime.utcnow().isoformat(),
        "risk_state": "WARNING",
        "dose_value": 134.5,
        "message": "H2S Exposure Warning: Elevated cumulative dose detected in Wellhead Gathering Station B.",
        "acknowledged": False
    }
]

connected_websockets: List[WebSocket] = []

@app.get("/")
def health_check():
    return {
        "system": "SulfSense Passive H2S Exposure Dosimeter API",
        "status": "ONLINE",
        "version": "1.0.0",
        "active_model": "cal-v2.1",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/workers", response_model=List[WorkerSummary])
def get_all_workers():
    return workers_db

@app.get("/api/workers/{worker_id}")
def get_worker(worker_id: str):
    worker = next((w for w in workers_db if w["id"] == worker_id), None)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@app.post("/api/readings", response_model=DoseEstimationResponse)
async def ingest_sensor_reading(payload: SensorIngestPayload):
    """
    Ingests sensor reading from ESP32 wearable wristband
    """
    res = ml_engine.estimate_dose(
        r=payload.red,
        g=payload.green,
        b=payload.blue,
        clear=payload.clear,
        temp=payload.temperature,
        rh=payload.humidity
    )

    # Update worker dose in memory
    for w in workers_db:
        if w["id"] == payload.worker_id or w.get("assigned_device_id") == payload.device_id:
            w["current_dose"] = res["estimated_dose"]
            w["risk_state"] = res["risk_state"]

    response_data = DoseEstimationResponse(
        estimated_dose=res["estimated_dose"],
        uncertainty=res["uncertainty"],
        reading_quality=res["reading_quality"],
        risk_state=res["risk_state"],
        delta_e=res["delta_e"],
        model_version="cal-v2.1",
        temperature_compensation_factor=res["temp_factor"]
    )

    # Broadcast to live WebSockets if any connected
    if connected_websockets:
        broadcast_msg = json.dumps({
            "device_id": payload.device_id,
            "worker_id": payload.worker_id,
            "telemetry": response_data.dict(),
            "raw": payload.dict()
        })
        for ws in connected_websockets:
            try:
                await ws.send_text(broadcast_msg)
            except:
                pass

    return response_data

@app.post("/api/dose/estimate", response_model=DoseEstimationResponse)
def estimate_dose_custom(req: DoseEstimationRequest):
    res = ml_engine.estimate_dose(
        r=req.raw_color.r,
        g=req.raw_color.g,
        b=req.raw_color.b,
        clear=req.raw_color.clear,
        temp=req.temperature,
        rh=req.humidity
    )
    return DoseEstimationResponse(
        estimated_dose=res["estimated_dose"],
        uncertainty=res["uncertainty"],
        reading_quality=res["reading_quality"],
        risk_state=res["risk_state"],
        delta_e=res["delta_e"],
        model_version=req.model_version or "cal-v2.1",
        temperature_compensation_factor=res["temp_factor"]
    )

@app.get("/api/alerts")
def get_alerts():
    return alerts_db

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    alert = next((a for a in alerts_db if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert["acknowledged"] = True
    return {"status": "success", "alert_id": alert_id}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            # Keep connection alive and receive any client events
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
