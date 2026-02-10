"""
Anomaly Detection using Isolation Forest
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List, Tuple


class AnomalyDetector:
    """
    Isolation Forest based anomaly detector
    """

    def __init__(self, params: Dict[str, Any] = None):
        """
        Initialize anomaly detector

        Args:
            params: Model parameters
        """
        self.params = params or {
            "contamination": 0.1,
            "n_estimators": 100,
            "max_samples": "auto",
            "random_state": 42
        }
        self.model = IsolationForest(**self.params)

    def train(self, X: np.ndarray) -> None:
        """
        Train the anomaly detection model

        Args:
            X: Training data (scaled features)
        """
        self.model.fit(X)

    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict anomalies

        Args:
            X: Input data (scaled features)

        Returns:
            Tuple of (predictions, anomaly scores)
            - predictions: 1 for normal, -1 for anomaly
            - anomaly_scores: Higher score means more anomalous (0-1 range)
        """
        predictions = self.model.predict(X)

        # Get decision function scores (negative means anomaly)
        decision_scores = self.model.decision_function(X)

        # Convert to 0-1 range (higher = more anomalous)
        # Normalize using min-max scaling
        min_score = decision_scores.min()
        max_score = decision_scores.max()

        if max_score - min_score > 0:
            anomaly_scores = (max_score - decision_scores) / (max_score - min_score)
        else:
            anomaly_scores = np.zeros_like(decision_scores)

        return predictions, anomaly_scores

    def get_params(self) -> Dict[str, Any]:
        """
        Get model parameters

        Returns:
            Dictionary of parameters
        """
        return self.params

    def get_feature_importance(self, X: np.ndarray, sample_idx: int) -> np.ndarray:
        """
        Get feature importance for a specific sample
        Uses path length approximation from decision function

        Args:
            X: Input data
            sample_idx: Index of sample to explain

        Returns:
            Array of feature importance scores (higher = more influential)
        """
        # Get decision path for the sample
        sample = X[sample_idx:sample_idx+1]

        # Compute feature contribution by analyzing tree paths
        # This is an approximation based on feature variance
        feature_variance = np.zeros(X.shape[1])

        for i in range(X.shape[1]):
            # Create perturbation: set feature i to mean value
            X_perturbed = sample.copy()
            X_perturbed[0, i] = 0  # Mean in scaled space

            # Measure score change
            original_score = self.model.decision_function(sample)[0]
            perturbed_score = self.model.decision_function(X_perturbed)[0]

            # Importance is the absolute change in score
            feature_variance[i] = abs(original_score - perturbed_score)

        return feature_variance

    def get_decision_scores(self, X: np.ndarray) -> np.ndarray:
        """
        Get raw decision function scores

        Args:
            X: Input data

        Returns:
            Array of decision scores (negative means anomaly)
        """
        return self.model.decision_function(X)
