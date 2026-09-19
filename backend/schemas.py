from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RawColorInput(BaseModel):
    r: int = Field(..., ge=0, le=255, description="Red channel 8-bit or normalized ADC")
    g: int = Field(..., ge=0, le=255, description="Green channel")
    b: int = Field(..., ge=0, le=255, description="Blue channel")
    clear: int = Field(..., ge=0, description="Clear photon count")

class SensorIngestPayload(BaseModel):
    device_id: str
    worker_id: Optional[str] = "W-101"
    timestamp: Optional[datetime] = None
    red: int
    green: int
    blue: int
    clear: int
    temperature: float
    humidity: float
    battery: int
    rssi: Optional[int] = -60

class DoseEstimationRequest(BaseModel):
    raw_color: RawColorInput
    temperature: float = 25.0
    humidity: float = 50.0
    model_version: Optional[str] = "cal-v2.1"

class DoseEstimationResponse(BaseModel):
    estimated_dose: float = Field(..., description="Estimated cumulative dose in ppm·min")
    dose_unit: str = "ppm.min"
    uncertainty: float = Field(..., description="Prediction interval ± in ppm·min")
    reading_quality: str
    risk_state: str
    delta_e: float
    model_version: str
    temperature_compensation_factor: float
    disclaimer: str = "ESTIMATED CUMULATIVE EXPOSURE BASED ON CALIBRATED COLORIMETRIC RESPONSE. NOT LABORATORY CONFIRMED MEASUREMENT."

class WorkerSummary(BaseModel):
    id: str
    name: str
    employee_code: str
    department: str
    shift: str
    assigned_device_id: Optional[str]
    current_dose: float
    risk_state: str
    status: str

class SafetyAlertPayload(BaseModel):
    id: str
    worker_id: str
    worker_name: str
    device_id: str
    timestamp: datetime
    risk_state: str
    dose_value: float
    message: str
    acknowledged: bool
