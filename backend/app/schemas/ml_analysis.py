"""
Pydantic schemas for ML Analysis API
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime


class TrainModelRequest(BaseModel):
    """
    Request schema for training a model
    """
    name: str = Field(..., description="Model name")
    start_date: datetime = Field(..., description="Training data start date")
    end_date: datetime = Field(..., description="Training data end date")
    algorithm: str = Field(default="isolation_forest", description="Algorithm name")
    params: Optional[Dict[str, Any]] = Field(default=None, description="Model parameters")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "model_v1",
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2024-01-31T23:59:59Z",
                "algorithm": "isolation_forest",
                "params": {
                    "contamination": 0.1,
                    "n_estimators": 100
                }
            }
        }


class TrainModelResponse(BaseModel):
    """
    Response schema for training result
    """
    model_id: int
    name: str
    model_path: str
    algorithm: str
    params: Dict[str, Any]
    training_samples: int
    created_at: str


class LogData(BaseModel):
    """
    Log data schema for analysis
    """
    protocol: str
    src_ip: str
    src_port: int
    dst_ip: str
    dst_port: int
    packets: int
    bytes: int


class AnalyzeLogsRequest(BaseModel):
    """
    Request schema for log analysis
    """
    model_id: int = Field(..., description="Model ID to use")
    logs: List[LogData] = Field(..., description="Logs to analyze")

    class Config:
        json_schema_extra = {
            "example": {
                "model_id": 1,
                "logs": [
                    {
                        "protocol": "TCP",
                        "src_ip": "192.168.1.1",
                        "src_port": 8080,
                        "dst_ip": "10.0.0.1",
                        "dst_port": 443,
                        "packets": 1000,
                        "bytes": 500000
                    }
                ]
            }
        }


class AnalysisResult(BaseModel):
    """
    Single log analysis result
    """
    log: Dict[str, Any]
    anomaly_score: float
    is_anomaly: bool
    confidence: float
    explanation: Optional[str] = Field(
        default=None,
        description="이상 탐지 이유 설명 (이상이 감지된 경우에만 제공)"
    )


class AnalyzeLogsResponse(BaseModel):
    """
    Response schema for log analysis
    """
    model_id: int
    model_name: str
    results: List[AnalysisResult]


class StatisticsResponse(BaseModel):
    """
    Response schema for statistics
    """
    period: Dict[str, str]
    statistics: Dict[str, Any]
    anomalies_detected: int


class ModelInfoResponse(BaseModel):
    """
    Response schema for model info
    """
    id: int
    name: str
    start_date: str
    end_date: str
    model_path: Optional[str]
    created_at: str
    is_merged: bool
    algorithm: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    trained_at: Optional[str] = None
    training_samples: Optional[int] = None
