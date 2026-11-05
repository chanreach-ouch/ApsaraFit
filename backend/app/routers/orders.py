import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.database import get_db
from app.models.order import Order
from app.models.measurement import Measurement
from app.models.garment import Garment
from app.schemas.order import OrderOut, OrderCreate, OrderUpdate
from app.schemas.measurement import MeasurementOut, MeasurementUpdate
from app.services.ease_calculator import apply_garment_ease, MEASUREMENT_TRANSLATIONS

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderOut])
def get_orders(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List orders for Mom's Tailor Dashboard.
    """
    query = db.query(Order).options(
        joinedload(Order.garment),
        joinedload(Order.measurements)
    ).order_by(Order.created_at.desc())
    
    if status:
        query = query.filter(Order.status == status)
    
    return query.limit(limit).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.garment),
        joinedload(Order.measurements)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Creates a new tailoring order from scan measurements with automatic garment ease applied.
    """
    garment = db.query(Garment).filter(Garment.id == payload.garment_id).first()
    if not garment:
        raise HTTPException(status_code=400, detail="Invalid garment ID")

    # Generate bespoke ticket number, e.g. "AF-2026-8742"
    ticket_num = f"AF-{datetime.utcnow().year}-{str(uuid.uuid4().int)[:4]}"

    db_order = Order(
        ticket_number=ticket_num,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_telegram=payload.customer_telegram,
        customer_email=payload.customer_email,
        customer_notes=payload.customer_notes,
        height_mm=payload.height_mm,
        weight_kg=payload.weight_kg,
        gender=payload.gender,
        garment_id=payload.garment_id,
        status="PENDING_REVIEW",
        mesh_data=payload.mesh_data
    )
    db.add(db_order)
    db.flush()

    # Process measurements and apply garment ease rules
    for m in payload.measurements:
        db_meas = Measurement(
            order_id=db_order.id,
            measurement_key=m.measurement_key,
            name_en=m.name_en,
            name_km=m.name_km,
            skin_value_mm=m.skin_value_mm,
            skin_value_cm=m.skin_value_cm,
            skin_value_in=m.skin_value_in,
            ease_mm=m.ease_mm,
            ease_cm=m.ease_cm,
            pattern_cut_cm=m.pattern_cut_cm,
            pattern_cut_in=m.pattern_cut_in,
            notes=m.notes
        )
        db.add(db_meas)

    db.commit()
    db.refresh(db_order)
    return db_order

@router.patch("/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payload.status is not None:
        order.status = payload.status
    if payload.customer_notes is not None:
        order.customer_notes = payload.customer_notes
    
    db.commit()
    db.refresh(order)
    return order

class EaseUpdateRequest(BaseModel):
    ease_cm: float
    notes: Optional[str] = None

@router.put("/{order_id}/measurements/{measurement_id}", response_model=MeasurementOut)
def update_measurement_ease(
    order_id: int,
    measurement_id: int,
    payload: EaseUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Allows the tailor to interactively adjust the ease on any measurement row,
    automatically recalculating final pattern cut cm and inches!
    """
    meas = db.query(Measurement).filter(
        Measurement.id == measurement_id,
        Measurement.order_id == order_id
    ).first()
    if not meas:
        raise HTTPException(status_code=404, detail="Measurement record not found")

    new_ease_cm = round(payload.ease_cm, 1)
    new_ease_mm = round(new_ease_cm * 10.0, 1)

    cut_mm = meas.skin_value_mm + new_ease_mm
    cut_cm = round(cut_mm / 10.0, 1)
    cut_in = round(cut_mm / 25.4, 2)

    meas.ease_cm = new_ease_cm
    meas.ease_mm = new_ease_mm
    meas.pattern_cut_cm = cut_cm
    meas.pattern_cut_in = cut_in
    if payload.notes:
        meas.notes = payload.notes
    else:
        meas.notes = f"Tailor custom ease: +{new_ease_cm} cm"

    db.commit()
    db.refresh(meas)
    return meas
