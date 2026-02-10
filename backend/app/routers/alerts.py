from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.alert import Alert
from app.models.traffic_log import TrafficLog
from app.models.ml_model import MLModel
from app.schemas.alert import AlertCreate, AlertResponse, AlertDetailResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(
    alert_data: AlertCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new alert when anomaly is detected.
    """
    # Validate that traffic_log exists
    traffic_log = db.query(TrafficLog).filter(
        TrafficLog.id == alert_data.traffic_log_id
    ).first()
    if not traffic_log:
        raise HTTPException(status_code=404, detail="Traffic log not found")

    # Validate that ml_model exists
    ml_model = db.query(MLModel).filter(
        MLModel.id == alert_data.ml_model_id
    ).first()
    if not ml_model:
        raise HTTPException(status_code=404, detail="ML model not found")

    db_alert = Alert(**alert_data.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.get("", response_model=List[AlertDetailResponse])
def get_alerts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    min_risk_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum risk score"),
    start_time: Optional[datetime] = Query(None, description="Filter by start detection time"),
    end_time: Optional[datetime] = Query(None, description="Filter by end detection time"),
    db: Session = Depends(get_db)
):
    """
    Retrieve alerts with pagination and filtering.
    Returns alerts sorted by detected_at in descending order (most recent first).
    Includes related traffic log and ML model details.
    """
    query = db.query(Alert)

    # Apply filters
    if min_risk_score is not None:
        query = query.filter(Alert.risk_score >= min_risk_score)
    if start_time:
        query = query.filter(Alert.detected_at >= start_time)
    if end_time:
        query = query.filter(Alert.detected_at <= end_time)

    # Order by detected_at descending (most recent first)
    query = query.order_by(Alert.detected_at.desc())

    # Apply pagination
    alerts = query.offset(skip).limit(limit).all()
    return alerts


@router.get("/{alert_id}", response_model=AlertDetailResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific alert by ID with related traffic log and ML model details.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
