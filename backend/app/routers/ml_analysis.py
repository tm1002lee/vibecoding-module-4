"""
ML Analysis API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.schemas.ml_analysis import (
    TrainModelRequest,
    TrainModelResponse,
    AnalyzeLogsRequest,
    AnalyzeLogsResponse,
    StatisticsResponse,
    ModelInfoResponse
)
from app.services.ml_service import MLService

router = APIRouter(prefix="/api/ml", tags=["ML Analysis"])


@router.post("/train", response_model=TrainModelResponse)
def train_model(
    request: TrainModelRequest,
    db: Session = Depends(get_db)
):
    """
    Train a new ML model

    Args:
        request: Training request with model configuration
        db: Database session

    Returns:
        Training result with model information

    Raises:
        HTTPException: If training fails
    """
    try:
        result = MLService.train_model(
            db=db,
            name=request.name,
            start_date=request.start_date,
            end_date=request.end_date,
            algorithm=request.algorithm,
            params=request.params or {}
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.post("/analyze", response_model=AnalyzeLogsResponse)
def analyze_logs(
    request: AnalyzeLogsRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze logs using trained model

    Args:
        request: Analysis request with model ID and logs
        db: Database session

    Returns:
        Analysis results with anomaly scores

    Raises:
        HTTPException: If analysis fails
    """
    try:
        # Convert LogData to dict
        logs_dict = [log.model_dump() for log in request.logs]

        result = MLService.analyze_logs(
            db=db,
            model_id=request.model_id,
            logs=logs_dict
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(
    start_date: datetime = Query(..., description="Start date for statistics"),
    end_date: datetime = Query(..., description="End date for statistics"),
    db: Session = Depends(get_db)
):
    """
    Get statistical analysis of traffic logs

    Args:
        start_date: Start datetime
        end_date: End datetime
        db: Database session

    Returns:
        Statistical metrics

    Raises:
        HTTPException: If statistics computation fails
    """
    try:
        result = MLService.get_statistics(
            db=db,
            start_date=start_date,
            end_date=end_date
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics computation failed: {str(e)}")


@router.get("/models", response_model=List[ModelInfoResponse])
def get_ml_models_list(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    is_merged: Optional[bool] = Query(None, description="Filter by merge status"),
    db: Session = Depends(get_db)
):
    """
    Get list of trained ML models

    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        is_merged: Filter by merge status (optional)
        db: Database session

    Returns:
        List of model information

    Raises:
        HTTPException: If query fails
    """
    try:
        from app.models.ml_model import MLModel

        query = db.query(MLModel)

        if is_merged is not None:
            query = query.filter(MLModel.is_merged == is_merged)

        query = query.order_by(MLModel.created_at.desc())
        models = query.offset(skip).limit(limit).all()

        # Convert to response schema
        return [
            ModelInfoResponse(
                id=model.id,
                name=model.name,
                start_date=model.start_date.isoformat(),
                end_date=model.end_date.isoformat(),
                model_path=model.model_path,
                created_at=model.created_at.isoformat(),
                is_merged=model.is_merged
            )
            for model in models
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get models list: {str(e)}")


@router.get("/models/{model_id}", response_model=ModelInfoResponse)
def get_model_info(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Get information about a trained model

    Args:
        model_id: Model ID
        db: Database session

    Returns:
        Model information

    Raises:
        HTTPException: If model not found
    """
    try:
        result = MLService.get_model_info(db=db, model_id=model_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")
