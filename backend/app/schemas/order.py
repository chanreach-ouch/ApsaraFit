from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.garment import GarmentOut
from app.schemas.measurement import MeasurementOut, MeasurementCreate

class OrderBase(BaseModel):
    customer_name: str
    customer_phone: str
    customer_telegram: Optional[str] = None
    customer_email: Optional[str] = None
    customer_notes: Optional[str] = None
    height_mm: float
    weight_kg: Optional[float] = None
    gender: str = "female"
    garment_id: int

class OrderCreate(OrderBase):
    measurements: List[MeasurementCreate] = Field(default_factory=list)
    mesh_data: Optional[Dict[str, Any]] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    customer_notes: Optional[str] = None

class OrderOut(OrderBase):
    id: int
    ticket_number: str
    status: str
    mesh_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    garment: Optional[GarmentOut] = None
    measurements: List[MeasurementOut] = Field(default_factory=list)

    class Config:
        from_attributes = True
