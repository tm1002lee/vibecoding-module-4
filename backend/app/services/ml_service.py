"""
ML Service - Orchestrates ML operations
"""
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.traffic_log import TrafficLog
from app.models.ml_model import MLModel
from app.ml.trainer import ModelTrainer
from app.ml.predictor import ModelPredictor
from app.ml.preprocessor import TrafficLogPreprocessor


class MLService:
    """
    Service for ML operations
    """

    @staticmethod
    def get_training_data(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Fetch training data from database

        Args:
            db: Database session
            start_date: Start datetime
            end_date: End datetime

        Returns:
            List of log dictionaries
        """
        logs = db.query(TrafficLog).filter(
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        ).all()

        return [
            {
                "protocol": log.protocol,
                "src_ip": log.src_ip,
                "src_port": log.src_port,
                "dst_ip": log.dst_ip,
                "dst_port": log.dst_port,
                "packets": log.packets,
                "bytes": log.bytes
            }
            for log in logs
        ]

    @staticmethod
    def train_model(
        db: Session,
        name: str,
        start_date: datetime,
        end_date: datetime,
        algorithm: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Train new ML model

        Args:
            db: Database session
            name: Model name
            start_date: Training data start date
            end_date: Training data end date
            algorithm: Algorithm name
            params: Model parameters

        Returns:
            Training result
        """
        # Fetch training data
        training_data = MLService.get_training_data(db, start_date, end_date)

        if len(training_data) == 0:
            raise ValueError("No training data found for the specified period")

        # Train model
        trainer = ModelTrainer()
        result = trainer.train(training_data, algorithm, params, name)

        # Save model metadata to database
        ml_model = MLModel(
            name=name,
            start_date=start_date,
            end_date=end_date,
            model_path=result["model_path"],
            created_at=datetime.utcnow()
        )
        db.add(ml_model)
        db.commit()
        db.refresh(ml_model)

        return {
            "model_id": ml_model.id,
            "name": ml_model.name,
            "model_path": ml_model.model_path,
            "algorithm": result["algorithm"],
            "params": result["params"],
            "training_samples": result["training_samples"],
            "created_at": ml_model.created_at.isoformat()
        }

    @staticmethod
    def analyze_logs(
        db: Session,
        model_id: int,
        logs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze logs using trained model

        Args:
            db: Database session
            model_id: Model ID
            logs: Logs to analyze

        Returns:
            Analysis results
        """
        # Get model from database
        ml_model = db.query(MLModel).filter(MLModel.id == model_id).first()
        if not ml_model:
            raise ValueError(f"Model not found: {model_id}")

        if not ml_model.model_path:
            raise ValueError(f"Model path not found for model: {model_id}")

        # Load predictor
        predictor = ModelPredictor(ml_model.model_path)

        # Predict
        results = predictor.predict(logs)

        return {
            "model_id": model_id,
            "model_name": ml_model.name,
            "results": results
        }

    @staticmethod
    def get_statistics(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Get statistical analysis of logs

        Args:
            db: Database session
            start_date: Start datetime
            end_date: End datetime

        Returns:
            Statistical metrics
        """
        # Fetch logs
        logs = MLService.get_training_data(db, start_date, end_date)

        if len(logs) == 0:
            return {
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "statistics": {},
                "anomalies_detected": 0
            }

        # Compute statistics
        preprocessor = TrafficLogPreprocessor()
        stats = preprocessor.compute_statistics(logs)

        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "statistics": stats,
            "anomalies_detected": 0  # This would require a trained model
        }

    @staticmethod
    def get_model_info(db: Session, model_id: int) -> Dict[str, Any]:
        """
        Get model information

        Args:
            db: Database session
            model_id: Model ID

        Returns:
            Model information
        """
        ml_model = db.query(MLModel).filter(MLModel.id == model_id).first()
        if not ml_model:
            raise ValueError(f"Model not found: {model_id}")

        result = {
            "id": ml_model.id,
            "name": ml_model.name,
            "start_date": ml_model.start_date.isoformat(),
            "end_date": ml_model.end_date.isoformat(),
            "model_path": ml_model.model_path,
            "created_at": ml_model.created_at.isoformat(),
            "is_merged": ml_model.is_merged
        }

        # If model file exists, load additional info
        if ml_model.model_path:
            try:
                predictor = ModelPredictor(ml_model.model_path)
                model_info = predictor.get_model_info()
                result.update(model_info)
            except Exception:
                pass

        return result
