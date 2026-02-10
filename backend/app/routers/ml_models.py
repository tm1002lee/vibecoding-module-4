from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.ml_model import MLModel
from app.schemas.ml_model import MLModelCreate, MLModelResponse, MLModelMergeRequest

router = APIRouter(prefix="/api/models", tags=["ML Models"])


@router.post("", response_model=MLModelResponse, status_code=201)
def create_ml_model(
    model_data: MLModelCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new ML model entry.
    Specifies the training period (start_date and end_date).
    """
    # Validate date range
    if model_data.start_date >= model_data.end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
        )

    db_model = MLModel(**model_data.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model


@router.get("", response_model=List[MLModelResponse])
def get_ml_models(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_merged: bool = Query(None, description="Filter by merged status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve ML models with pagination and filtering.
    """
    query = db.query(MLModel)

    # Apply filters
    if is_merged is not None:
        query = query.filter(MLModel.is_merged == is_merged)

    # Order by created_at descending (most recent first)
    query = query.order_by(MLModel.created_at.desc())

    # Apply pagination
    models = query.offset(skip).limit(limit).all()
    return models


@router.get("/{model_id}", response_model=MLModelResponse)
def get_ml_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific ML model by ID.
    """
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="ML model not found")
    return model


@router.post("/merge", response_model=MLModelResponse, status_code=201)
def merge_ml_models(
    merge_request: MLModelMergeRequest,
    db: Session = Depends(get_db)
):
    """
    Merge multiple ML models into a new merged model.
    Accepts a list of model IDs to merge.
    """
    # Validate that all models exist
    models = db.query(MLModel).filter(MLModel.id.in_(merge_request.model_ids)).all()

    if len(models) != len(merge_request.model_ids):
        raise HTTPException(
            status_code=404,
            detail="One or more model IDs not found"
        )

    # Calculate date range (min start_date, max end_date)
    start_date = min(model.start_date for model in models)
    end_date = max(model.end_date for model in models)

    # Create merged model
    merged_model = MLModel(
        name=merge_request.merged_model_name,
        start_date=start_date,
        end_date=end_date,
        model_path=None,  # Will be set after actual merging process
        is_merged=True,
        created_at=datetime.utcnow()
    )

    db.add(merged_model)
    db.commit()
    db.refresh(merged_model)
    return merged_model
