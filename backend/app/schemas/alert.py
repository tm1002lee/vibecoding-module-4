from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

from app.schemas.traffic_log import TrafficLogResponse
from app.schemas.ml_model import MLModelResponse


class AlertCreate(BaseModel):
    traffic_log_id: int = Field(..., description="Traffic log ID")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score (0-100)")
    ml_model_id: int = Field(..., description="ML model ID used for detection")
    description: Optional[str] = Field(default=None, description="Alert description")

    @field_validator('risk_score')
    @classmethod
    def validate_risk_score(cls, v: int) -> int:
        if not 0 <= v <= 100:
            raise ValueError('risk_score must be between 0 and 100')
        return v


class AlertResponse(BaseModel):
    id: int
    traffic_log_id: int
    risk_score: int
    ml_model_id: int
    detected_at: datetime
    description: Optional[str]

    class Config:
        from_attributes = True


class AlertDetailResponse(AlertResponse):
    """Alert with related traffic log and ML model details"""
    traffic_log: TrafficLogResponse
    ml_model: MLModelResponse

    class Config:
        from_attributes = True
