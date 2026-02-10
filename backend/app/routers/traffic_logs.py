from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.traffic_log import TrafficLog
from app.schemas.traffic_log import TrafficLogCreate, TrafficLogResponse

router = APIRouter(prefix="/api/logs", tags=["Traffic Logs"])


@router.post("", response_model=TrafficLogResponse, status_code=201)
def create_traffic_log(
    log_data: TrafficLogCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new traffic log entry.
    Used by logcollector to submit traffic data.
    """
    # timestamp가 제공되지 않으면 현재 시각 사용
    log_dict = log_data.model_dump()
    if log_dict.get("timestamp") is None:
        log_dict["timestamp"] = datetime.utcnow()

    db_log = TrafficLog(**log_dict)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


@router.get("", response_model=List[TrafficLogResponse])
def get_traffic_logs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    src_ip: Optional[str] = Query(None, description="Filter by source IP"),
    dst_ip: Optional[str] = Query(None, description="Filter by destination IP"),
    protocol: Optional[str] = Query(None, description="Filter by protocol"),
    start_time: Optional[datetime] = Query(None, description="Filter by start timestamp"),
    end_time: Optional[datetime] = Query(None, description="Filter by end timestamp"),
    db: Session = Depends(get_db)
):
    """
    Retrieve traffic logs with pagination and filtering.
    """
    query = db.query(TrafficLog)

    # Apply filters
    if src_ip:
        query = query.filter(TrafficLog.src_ip == src_ip)
    if dst_ip:
        query = query.filter(TrafficLog.dst_ip == dst_ip)
    if protocol:
        query = query.filter(TrafficLog.protocol == protocol)
    if start_time:
        query = query.filter(TrafficLog.timestamp >= start_time)
    if end_time:
        query = query.filter(TrafficLog.timestamp <= end_time)

    # Order by timestamp descending (most recent first)
    query = query.order_by(TrafficLog.timestamp.desc())

    # Apply pagination
    logs = query.offset(skip).limit(limit).all()
    return logs


@router.get("/{log_id}", response_model=TrafficLogResponse)
def get_traffic_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific traffic log by ID.
    """
    log = db.query(TrafficLog).filter(TrafficLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Traffic log not found")
    return log
