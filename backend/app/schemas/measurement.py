from typing import Optional
from pydantic import BaseModel

class MeasurementBase(BaseModel):
    measurement_key: str
    name_en: str
    name_km: str
    skin_value_mm: float
    skin_value_cm: float
    skin_value_in: float
    ease_mm: float = 0.0
    ease_cm: float = 0.0
    pattern_cut_cm: float
    pattern_cut_in: float
    notes: Optional[str] = None

class MeasurementCreate(MeasurementBase):
    pass

class MeasurementUpdate(BaseModel):
    ease_cm: Optional[float] = None
    notes: Optional[str] = None

class MeasurementOut(MeasurementBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True
