from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(100), nullable=False)
    customer_telegram = Column(String(100), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_notes = Column(Text, nullable=True)

    # Physical specs
    height_mm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=True)
    gender = Column(String(20), default="female")

    # Garment chosen
    garment_id = Column(Integer, ForeignKey("garments.id"), nullable=False)
    garment = relationship("Garment")

    # Status: PENDING_REVIEW, IN_CUTTING, SEWING, COMPLETED, DELIVERED
    status = Column(String(50), default="PENDING_REVIEW")

    # Reconstructed 3D mesh data (parametric slices, vertices, rings)
    mesh_data = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to detailed measurements
    measurements = relationship("Measurement", back_populates="order", cascade="all, delete-orphan")
