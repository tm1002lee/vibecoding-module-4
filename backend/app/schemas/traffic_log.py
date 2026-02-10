from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TrafficLogCreate(BaseModel):
    protocol: str = Field(..., description="Protocol type (TCP/UDP/ICMP)")
    src_ip: str = Field(..., description="Source IP address")
    src_port: int = Field(..., ge=0, le=65535, description="Source port")
    dst_ip: str = Field(..., description="Destination IP address")
    dst_port: int = Field(..., ge=0, le=65535, description="Destination port")
    packets: int = Field(..., ge=0, description="Number of packets")
    bytes: int = Field(..., ge=0, description="Number of bytes")
    timestamp: Optional[datetime] = Field(default=None, description="Log timestamp")
    cpu_id: Optional[int] = Field(default=0, description="CPU ID")


class TrafficLogResponse(BaseModel):
    id: int
    protocol: str
    src_ip: str
    src_port: int
    dst_ip: str
    dst_port: int
    packets: int
    bytes: int
    timestamp: datetime
    cpu_id: Optional[int]

    class Config:
        from_attributes = True
