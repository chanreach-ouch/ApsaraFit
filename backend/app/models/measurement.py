from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    order = relationship("Order", back_populates="measurements")

    # Key identifier, e.g. "shoulder_width", "chest_bust_circumference"
    measurement_key = Column(String(100), nullable=False)
    name_en = Column(String(150), nullable=False)
    name_km = Column(String(150), nullable=False)

    # Skin body measurement
    skin_value_mm = Column(Float, nullable=False)
    skin_value_cm = Column(Float, nullable=False)
    skin_value_in = Column(Float, nullable=False)

    # Ease applied
    ease_mm = Column(Float, default=0.0)
    ease_cm = Column(Float, default=0.0)

    # Final Pattern Cut calculation = skin + ease
    pattern_cut_cm = Column(Float, nullable=False)
    pattern_cut_in = Column(Float, nullable=False)

    notes = Column(String(255), nullable=True)
