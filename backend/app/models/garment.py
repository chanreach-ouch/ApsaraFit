from sqlalchemy import Column, Integer, String, Text, Float, JSON
from app.database import Base

class Garment(Base):
    __tablename__ = "garments"

    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(255), nullable=False)
    name_km = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)  # blouse, wrap, set, dress, jacket, pants
    description_en = Column(Text, nullable=False)
    description_km = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=False)
    fabric_type = Column(String(100), nullable=False)
    price_usd = Column(Float, default=0.0)

    # Ease rules stored as JSON: { "bust": 30.0, "waist": 20.0, ... } in mm
    ease_rules = Column(JSON, default=dict)

    # List of required measurement keys for this garment
    required_measurements = Column(JSON, default=list)
