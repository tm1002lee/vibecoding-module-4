from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    traffic_log_id = Column(Integer, ForeignKey("traffic_logs.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)  # 0-100
    ml_model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=False)
    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    description = Column(String, nullable=True)

    # Relationships
    traffic_log = relationship("TrafficLog", backref="alerts")
    ml_model = relationship("MLModel", backref="alerts")
