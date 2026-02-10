from sqlalchemy import Column, Integer, String, DateTime, Index
from datetime import datetime

from app.database import Base


class TrafficLog(Base):
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    protocol = Column(String, nullable=False)
    src_ip = Column(String, nullable=False, index=True)
    src_port = Column(Integer, nullable=False)
    dst_ip = Column(String, nullable=False, index=True)
    dst_port = Column(Integer, nullable=False)
    packets = Column(Integer, nullable=False)
    bytes = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    cpu_id = Column(Integer, nullable=True, default=0)

    # 복합 인덱스: 시간 기반 쿼리 최적화
    __table_args__ = (
        Index('idx_timestamp_src_ip', 'timestamp', 'src_ip'),
        Index('idx_timestamp_dst_ip', 'timestamp', 'dst_ip'),
    )
