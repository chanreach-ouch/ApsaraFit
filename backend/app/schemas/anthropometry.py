from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CalibrationInput(BaseModel):
    height_mm: float = Field(..., gt=500.0, lt=2600.0, description="Height in millimeters")
    weight_kg: Optional[float] = Field(default=None, gt=20.0, lt=300.0)
    gender: str = Field(default="female", description="'female' or 'male'")
    has_reference_card: bool = Field(default=False)
    reference_card_width_mm: float = Field(default=85.6)

class TurnaroundScanRequest(BaseModel):
    frames: Dict[str, str] = Field(
        ...,
        description="Dictionary mapping angle string ('0', '45', '90', '135', '180', '225', '270', '315') to base64 JPEG/PNG"
    )
    height_cm: Optional[float] = Field(default=None, gt=50.0, lt=260.0, description="Height in centimeters")
    height_mm: Optional[float] = Field(default=None, gt=500.0, lt=2600.0, description="Height in millimeters")
    weight_kg: Optional[float] = Field(default=None, gt=20.0, lt=300.0)
    gender: str = Field(default="female", description="'female' or 'male'")
    has_reference_card: bool = Field(default=False)

class MeasurementItem(BaseModel):
    key: str
    name_en: str
    name_km: str
    skin_mm: float
    skin_cm: float
    skin_in: float
    confidence: float = 0.95

class MeshRing(BaseModel):
    name: str
    name_km: str
    y_norm: float
    y_mm: float
    radius_a_mm: float
    radius_b_mm: float
    circumference_mm: float
    circumference_cm: float
    slice_index: int

class MeshSlice(BaseModel):
    y_norm: float
    y_mm: float
    radius_a_mm: float
    radius_b_mm: float

class MeshData(BaseModel):
    height_mm: float
    gender: str
    slices: List[MeshSlice]
    rings: List[MeshRing]
    vertices: List[List[float]]
    faces: List[List[int]]

class ScanResponse(BaseModel):
    success: bool
    engine_used: str  # "Built-In Metric Silhouette & Elliptical Slicing Engine" or "SMPL-X / SHAPY"
    calibration: Dict[str, Any]
    measurements: List[MeasurementItem]
    mesh_data: MeshData
    privacy_verified: bool = True
    photos_purged: bool = True
    message: str
