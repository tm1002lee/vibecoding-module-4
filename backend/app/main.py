from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import examples, traffic_logs, ml_models, alerts, ml_analysis

# Import models to ensure they are registered with Base
from app.models import traffic_log, ml_model, alert

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Module 5 API - Firewall Traffic Analysis", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(examples.router)
app.include_router(traffic_logs.router)
app.include_router(ml_models.router)
app.include_router(alerts.router)
app.include_router(ml_analysis.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI 서버가 정상 작동 중입니다."}
