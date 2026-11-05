from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.garment import Garment
from app.schemas.garment import GarmentOut, GarmentCreate

router = APIRouter(prefix="/garments", tags=["Garments"])

@router.get("", response_model=List[GarmentOut])
def get_all_garments(db: Session = Depends(get_db)):
    """
    Returns all traditional garments with their tailoring ease rules and required measurements.
    """
    return db.query(Garment).all()

@router.get("/{garment_id}", response_model=GarmentOut)
def get_garment_by_id(garment_id: int, db: Session = Depends(get_db)):
    garment = db.query(Garment).filter(Garment.id == garment_id).first()
    if not garment:
        raise HTTPException(status_code=404, detail="Garment not found")
    return garment

@router.get("/by-slug/{slug}", response_model=GarmentOut)
def get_garment_by_slug(slug: str, db: Session = Depends(get_db)):
    garment = db.query(Garment).filter(Garment.slug == slug).first()
    if not garment:
        raise HTTPException(status_code=404, detail="Garment not found")
    return garment
