from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class MLModelCreate(BaseModel):
    name: str = Field(..., description="Model name")
    start_date: datetime = Field(..., description="Training start date")
    end_date: datetime = Field(..., description="Training end date")
    model_path: Optional[str] = Field(default=None, description="Model file path")

    model_config = {"protected_namespaces": ()}


class MLModelResponse(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    model_path: Optional[str]
    created_at: datetime
    is_merged: bool

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class MLModelMergeRequest(BaseModel):
    model_ids: List[int] = Field(..., min_length=2, description="List of model IDs to merge")
    merged_model_name: str = Field(..., description="Name for the merged model")

    model_config = {"protected_namespaces": ()}
