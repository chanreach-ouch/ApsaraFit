from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel

from app.schemas.anthropometry import ScanResponse, TurnaroundScanRequest
from app.services.anthropometry import anthropometry_engine

router = APIRouter(prefix="/measure", tags=["Anthropometric Scanning"])

class DemoScanRequest(BaseModel):
    height_mm: float = 1650.0
    weight_kg: Optional[float] = 55.0
    gender: str = "female"

@router.post("/scan-360", response_model=ScanResponse)
def perform_turnaround_scan_360(payload: TurnaroundScanRequest):
    """
    Hands-Free 360° Guided Turnaround Scan Endpoint.
    Accepts 8-sector turnaround frame bundle (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°),
    runs multi-angle cross-sectional polygon reconstruction, extracts 14 measurements,
    generates 3D lofted parametric mannequin, and purges all raw photo buffers.
    """
    height_mm = payload.height_mm
    if height_mm is None and payload.height_cm is not None:
        height_mm = payload.height_cm * 10.0
    elif height_mm is None:
        height_mm = 1650.0

    if height_mm < 500 or height_mm > 2600:
        raise HTTPException(status_code=400, detail="Invalid height. Must be between 50 cm and 260 cm.")

    return anthropometry_engine.process_turnaround_360_scan(
        frames=payload.frames,
        height_mm=height_mm,
        weight_kg=payload.weight_kg,
        gender=payload.gender,
        has_reference_card=payload.has_reference_card
    )

@router.post("/scan", response_model=ScanResponse)
async def perform_body_scan(
    request: Request,
    front_image: Optional[UploadFile] = File(None),
    side_image: Optional[UploadFile] = File(None),
    height_mm: Optional[float] = Form(None),
    height_cm: Optional[float] = Form(None),
    weight_kg: Optional[float] = Form(None),
    gender: str = Form("female"),
    has_reference_card: bool = Form(False)
):
    """
    Universal scan endpoint supporting both 360° Turnaround JSON bundle and multipart forms.
    """
    content_type = request.headers.get("content-type", "")

    # Handle 360 Turnaround JSON request
    if "application/json" in content_type:
        body = await request.json()
        payload = TurnaroundScanRequest(**body)
        h_mm = payload.height_mm
        if h_mm is None and payload.height_cm is not None:
            h_mm = payload.height_cm * 10.0
        elif h_mm is None:
            h_mm = 1650.0

        return anthropometry_engine.process_turnaround_360_scan(
            frames=payload.frames,
            height_mm=h_mm,
            weight_kg=payload.weight_kg,
            gender=payload.gender,
            has_reference_card=payload.has_reference_card
        )

    # Handle multipart upload (Front & Side)
    calc_h_mm = height_mm or (height_cm * 10.0 if height_cm else 1650.0)
    if calc_h_mm < 500 or calc_h_mm > 2600:
        raise HTTPException(status_code=400, detail="Invalid stature. Must be between 500 mm and 2600 mm.")

    if not front_image or not side_image:
        return anthropometry_engine.generate_demo_scan(calc_h_mm, weight_kg, gender)

    front_bytes = await front_image.read()
    side_bytes = await side_image.read()

    result = anthropometry_engine.process_body_scan(
        front_img_bytes=front_bytes,
        side_img_bytes=side_bytes,
        height_mm=calc_h_mm,
        weight_kg=weight_kg,
        gender=gender,
        has_reference_card=has_reference_card
    )

    return result

@router.post("/demo", response_model=ScanResponse)
def perform_demo_scan(payload: DemoScanRequest):
    """
    Instant 1-Click Demo Scan with synthesized anatomical proportions.
    Guarantees testing is instant even without standing back from a webcam.
    """
    return anthropometry_engine.generate_demo_scan(
        height_mm=payload.height_mm,
        weight_kg=payload.weight_kg,
        gender=payload.gender
    )
