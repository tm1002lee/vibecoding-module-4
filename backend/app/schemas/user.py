from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    password_hash: str
