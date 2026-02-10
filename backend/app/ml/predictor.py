"""
Model Prediction Logic
"""
import os
import joblib
import numpy as np
from typing import Dict, Any, List


class ModelPredictor:
    """
    Handles model loading and prediction
    """

    def __init__(self, model_path: str):
        """
        Initialize predictor with saved model

        Args:
            model_path: Path to saved model file
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        # Load model data
        self.model_data = joblib.load(model_path)
        self.detector = self.model_data["detector"]
        self.preprocessor = self.model_data["preprocessor"]
        self.algorithm = self.model_data["algorithm"]
        self.params = self.model_data["params"]

    def predict(self, logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict anomalies for given logs

        Args:
            logs: List of log dictionaries

        Returns:
            List of prediction results
        """
        if len(logs) == 0:
            return []

        # Preprocess data
        X_scaled, X_features = self.preprocessor.transform(logs)

        # Predict
        predictions, anomaly_scores = self.detector.predict(X_scaled)

        # Get training statistics for explanation
        training_stats = self.preprocessor.get_training_stats()
        feature_names = self.preprocessor.get_feature_names()

        # Build results
        results = []
        for i, log in enumerate(logs):
            is_anomaly = predictions[i] == -1
            anomaly_score = float(anomaly_scores[i])

            # Calculate confidence (inverse of distance from decision boundary)
            confidence = anomaly_score if is_anomaly else (1.0 - anomaly_score)

            # Generate explanation if anomaly detected
            explanation = None
            if is_anomaly and training_stats:
                explanation = self._generate_explanation(
                    log=log,
                    feature_values=X_features.iloc[i],
                    scaled_values=X_scaled[i],
                    feature_names=feature_names,
                    training_stats=training_stats,
                    sample_idx=i,
                    X_scaled=X_scaled
                )

            result = {
                "log": log,
                "anomaly_score": round(anomaly_score, 4),
                "is_anomaly": bool(is_anomaly),
                "confidence": round(confidence, 4),
                "explanation": explanation
            }
            results.append(result)

        return results

    def _generate_explanation(
        self,
        log: Dict[str, Any],
        feature_values: Any,
        scaled_values: np.ndarray,
        feature_names: List[str],
        training_stats: Dict[str, Dict[str, float]],
        sample_idx: int,
        X_scaled: np.ndarray
    ) -> str:
        """
        Generate human-readable explanation for anomaly detection

        Args:
            log: Original log data
            feature_values: Extracted feature values
            scaled_values: Scaled feature values
            feature_names: List of feature names
            training_stats: Training statistics for each feature
            sample_idx: Sample index
            X_scaled: All scaled samples

        Returns:
            Korean explanation string
        """
        reasons = []

        # Get feature importance for this sample
        try:
            feature_importance = self.detector.get_feature_importance(X_scaled, sample_idx)
            # Get top 3 most important features
            top_indices = np.argsort(feature_importance)[-3:][::-1]
        except:
            # Fallback: check all features
            top_indices = range(len(feature_names))

        # Analyze each important feature
        for idx in top_indices:
            if idx >= len(feature_names):
                continue

            feature_name = feature_names[idx]
            value = feature_values[feature_name]
            stats = training_stats.get(feature_name, {})

            if not stats:
                continue

            mean = stats["mean"]
            std = stats["std"]
            q1 = stats["q1"]
            q3 = stats["q3"]

            # Calculate deviation
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            # Human-readable feature names
            feature_display_names = {
                "packets": "패킷 수",
                "bytes": "전송 바이트",
                "src_port": "발신 포트",
                "dst_port": "목적지 포트",
                "protocol_numeric": "프로토콜",
                "src_ip_numeric": "발신 IP",
                "dst_ip_numeric": "목적지 IP"
            }

            display_name = feature_display_names.get(feature_name, feature_name)

            # Check for anomalies
            if value > upper_bound:
                # High value anomaly
                if feature_name in ["packets", "bytes"]:
                    ratio = value / mean if mean > 0 else 0
                    reasons.append(
                        f"{display_name}({int(value):,})가 평균({int(mean):,})보다 {ratio:.1f}배 높음"
                    )
                elif feature_name in ["src_port", "dst_port"]:
                    reasons.append(
                        f"{display_name}({int(value)})가 정상 범위({int(lower_bound)}-{int(upper_bound)})를 벗어남"
                    )
            elif value < lower_bound:
                # Low value anomaly
                if feature_name in ["packets", "bytes"]:
                    reasons.append(
                        f"{display_name}({int(value):,})가 평균({int(mean):,})보다 비정상적으로 낮음"
                    )
            elif abs(value - mean) > 2 * std and std > 0:
                # Moderate deviation (2 sigma)
                if feature_name in ["packets", "bytes"]:
                    reasons.append(
                        f"{display_name}({int(value):,})가 정상 패턴(평균 {int(mean):,})과 차이가 큼"
                    )

            # Limit to top 3 reasons
            if len(reasons) >= 3:
                break

        # Add protocol-specific context
        protocol = log.get("protocol", "")
        if protocol:
            reasons.append(f"프로토콜: {protocol}")

        # Combine reasons
        if reasons:
            return " | ".join(reasons)
        else:
            return "여러 특성의 조합이 정상 패턴과 다름"

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get model information

        Returns:
            Model metadata
        """
        return {
            "algorithm": self.algorithm,
            "params": self.params,
            "trained_at": self.model_data.get("trained_at"),
            "training_samples": self.model_data.get("training_samples")
        }
