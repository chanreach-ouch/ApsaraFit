from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class GarmentBase(BaseModel):
    name_en: str
    name_km: str
    slug: str
    category: str
    description_en: str
    description_km: str
    image_url: str
    fabric_type: str
    price_usd: float = 0.0
    ease_rules: Dict[str, float] = Field(default_factory=dict, description="Ease in mm per measurement key")
    required_measurements: List[str] = Field(default_factory=list)

class GarmentCreate(GarmentBase):
    pass

class GarmentOut(GarmentBase):
    id: int

    class Config:
        from_attributes = True
