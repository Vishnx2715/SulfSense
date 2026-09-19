from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./sulfsense.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class WorkerModel(Base):
    __tablename__ = "workers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    employee_code = Column(String, unique=True, index=True)
    role = Column(String)
    department = Column(String)
    shift = Column(String)
    assigned_device_id = Column(String, nullable=True)
    current_dose = Column(Float, default=0.0)
    risk_state = Column(String, default="NORMAL")
    status = Column(String, default="ACTIVE")
    last_update = Column(DateTime, default=datetime.utcnow)

class DeviceModel(Base):
    __tablename__ = "devices"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    mac_address = Column(String)
    assigned_worker_id = Column(String, nullable=True)
    status = Column(String, default="ONLINE")
    battery = Column(Integer, default=100)
    firmware_version = Column(String, default="v2.4.1-ota")
    strip_batch_id = Column(String, default="BATCH-2026-A1")
    strip_used_hours = Column(Float, default=0.0)
    last_sync = Column(DateTime, default=datetime.utcnow)

class SensorReadingModel(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, index=True)
    worker_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    r = Column(Integer)
    g = Column(Integer)
    b = Column(Integer)
    clear = Column(Integer)
    temperature = Column(Float)
    humidity = Column(Float)
    delta_e = Column(Float)
    estimated_dose = Column(Float)
    dose_uncertainty = Column(Float)
    reading_quality = Column(String)
    risk_state = Column(String)
    model_version = Column(String, default="cal-v2.1")

class AlertModel(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True)
    worker_id = Column(String, index=True)
    worker_name = Column(String)
    device_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    risk_state = Column(String)
    dose_value = Column(Float)
    message = Column(String)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)
