"""
Model Training Logic
"""
import os
import joblib
from typing import Dict, Any, List
from datetime import datetime

from app.ml.anomaly_detector import AnomalyDetector
from app.ml.preprocessor import TrafficLogPreprocessor
from app.ml.utils import generate_model_filename, get_model_directory, validate_params


class ModelTrainer:
    """
    Handles model training workflow
    """

    def __init__(self):
        self.preprocessor = TrafficLogPreprocessor()
        self.detector = None
        self.model_path = None

    def train(
        self,
        logs: List[Dict[str, Any]],
        algorithm: str,
        params: Dict[str, Any],
        model_name: str
    ) -> Dict[str, Any]:
        """
        Train anomaly detection model

        Args:
            logs: Training data (list of log dictionaries)
            algorithm: Algorithm name (e.g., "isolation_forest")
            params: Model parameters
            model_name: Name for the model

        Returns:
            Training result dictionary
        """
        if len(logs) == 0:
            raise ValueError("No training data provided")

        # Validate and get parameters
        validated_params = validate_params(algorithm, params)

        # Initialize detector
        if algorithm == "isolation_forest":
            self.detector = AnomalyDetector(validated_params)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

        # Preprocess data
        X_scaled, X_features = self.preprocessor.fit_transform(logs)

        # Train model
        self.detector.train(X_scaled)

        # Save model
        model_dir = get_model_directory()
        filename = generate_model_filename(model_name, algorithm)
        self.model_path = os.path.join(model_dir, filename)

        # Save both preprocessor and detector
        model_data = {
            "detector": self.detector,
            "preprocessor": self.preprocessor,
            "algorithm": algorithm,
            "params": validated_params,
            "trained_at": datetime.utcnow().isoformat(),
            "training_samples": len(logs)
        }

        joblib.dump(model_data, self.model_path)

        return {
            "model_path": self.model_path,
            "algorithm": algorithm,
            "params": validated_params,
            "training_samples": len(logs),
            "status": "success"
        }

    def get_model_path(self) -> str:
        """
        Get saved model path

        Returns:
            Model file path
        """
        return self.model_path
