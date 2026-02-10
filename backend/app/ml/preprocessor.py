"""
Data Preprocessor for ML Models
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.preprocessing import StandardScaler

from app.ml.utils import ip_to_numeric, protocol_to_numeric


class TrafficLogPreprocessor:
    """
    Preprocessor for traffic log data
    """

    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_columns = [
            "protocol_numeric",
            "src_ip_numeric",
            "src_port",
            "dst_ip_numeric",
            "dst_port",
            "packets",
            "bytes"
        ]
        # Store training statistics for explanation
        self.training_stats = None

    def extract_features(self, logs: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Extract features from raw log data

        Args:
            logs: List of log dictionaries

        Returns:
            DataFrame with extracted features
        """
        df = pd.DataFrame(logs)

        # Convert IP addresses to numeric
        df["src_ip_numeric"] = df["src_ip"].apply(ip_to_numeric)
        df["dst_ip_numeric"] = df["dst_ip"].apply(ip_to_numeric)

        # Convert protocol to numeric
        df["protocol_numeric"] = df["protocol"].apply(protocol_to_numeric)

        # Select feature columns
        feature_df = df[self.feature_columns].copy()

        # Handle missing values
        feature_df = feature_df.fillna(0)

        return feature_df

    def fit_transform(self, logs: List[Dict[str, Any]]) -> Tuple[np.ndarray, pd.DataFrame]:
        """
        Fit scaler and transform data for training

        Args:
            logs: List of log dictionaries

        Returns:
            Tuple of (scaled features, original feature dataframe)
        """
        feature_df = self.extract_features(logs)
        scaled_features = self.scaler.fit_transform(feature_df)

        # Store training statistics for explanation generation
        self.training_stats = {
            col: {
                "mean": float(feature_df[col].mean()),
                "std": float(feature_df[col].std()),
                "min": float(feature_df[col].min()),
                "max": float(feature_df[col].max()),
                "q1": float(feature_df[col].quantile(0.25)),
                "q3": float(feature_df[col].quantile(0.75))
            }
            for col in self.feature_columns
        }

        return scaled_features, feature_df

    def transform(self, logs: List[Dict[str, Any]]) -> Tuple[np.ndarray, pd.DataFrame]:
        """
        Transform data using fitted scaler (for prediction)

        Args:
            logs: List of log dictionaries

        Returns:
            Tuple of (scaled features, original feature dataframe)
        """
        feature_df = self.extract_features(logs)
        scaled_features = self.scaler.transform(feature_df)

        return scaled_features, feature_df

    def compute_statistics(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute statistical features from logs

        Args:
            logs: List of log dictionaries

        Returns:
            Dictionary of statistical metrics
        """
        df = pd.DataFrame(logs)

        if len(df) == 0:
            return {}

        stats = {
            "total_logs": len(df),
            "packets": {
                "mean": float(df["packets"].mean()),
                "std": float(df["packets"].std()),
                "min": int(df["packets"].min()),
                "max": int(df["packets"].max()),
                "median": float(df["packets"].median()),
                "threshold_upper": float(df["packets"].mean() + 2 * df["packets"].std())
            },
            "bytes": {
                "mean": float(df["bytes"].mean()),
                "std": float(df["bytes"].std()),
                "min": int(df["bytes"].min()),
                "max": int(df["bytes"].max()),
                "median": float(df["bytes"].median()),
                "threshold_upper": float(df["bytes"].mean() + 2 * df["bytes"].std())
            },
            "top_src_ips": df["src_ip"].value_counts().head(10).to_dict(),
            "top_dst_ips": df["dst_ip"].value_counts().head(10).to_dict(),
            "protocol_distribution": df["protocol"].value_counts().to_dict()
        }

        return stats

    def get_feature_names(self) -> List[str]:
        """
        Get feature column names

        Returns:
            List of feature names
        """
        return self.feature_columns

    def get_training_stats(self) -> Dict[str, Dict[str, float]]:
        """
        Get training statistics for each feature

        Returns:
            Dictionary of statistics for each feature
        """
        return self.training_stats if self.training_stats else {}
