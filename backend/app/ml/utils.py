"""
ML Utility Functions
"""
import os
import hashlib
from datetime import datetime
from typing import Dict, Any


def generate_model_filename(name: str, algorithm: str) -> str:
    """
    Generate unique model filename

    Args:
        name: Model name
        algorithm: Algorithm name

    Returns:
        Unique filename
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    hash_str = hashlib.md5(f"{name}{timestamp}".encode()).hexdigest()[:8]
    return f"{algorithm}_{name}_{timestamp}_{hash_str}.pkl"


def get_model_directory() -> str:
    """
    Get model storage directory path

    Returns:
        Absolute path to models directory
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_dir = os.path.join(base_dir, "models")

    # Create directory if not exists
    os.makedirs(model_dir, exist_ok=True)

    return model_dir


def validate_params(algorithm: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and return default parameters for algorithm

    Args:
        algorithm: Algorithm name
        params: User-provided parameters

    Returns:
        Validated parameters with defaults
    """
    if algorithm == "isolation_forest":
        default_params = {
            "contamination": 0.1,
            "n_estimators": 100,
            "max_samples": "auto",
            "random_state": 42
        }
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")

    # Merge with user params
    validated = default_params.copy()
    if params:
        validated.update(params)

    return validated


def ip_to_numeric(ip: str) -> int:
    """
    Convert IP address string to numeric value

    Args:
        ip: IP address string (e.g., "192.168.1.1")

    Returns:
        Numeric representation
    """
    try:
        parts = ip.split('.')
        return (int(parts[0]) << 24) + (int(parts[1]) << 16) + (int(parts[2]) << 8) + int(parts[3])
    except:
        return 0


def protocol_to_numeric(protocol: str) -> int:
    """
    Convert protocol string to numeric value

    Args:
        protocol: Protocol name (TCP, UDP, ICMP, etc.)

    Returns:
        Numeric representation
    """
    protocol_map = {
        "TCP": 6,
        "UDP": 17,
        "ICMP": 1,
        "IGMP": 2,
        "ESP": 50,
        "AH": 51
    }
    return protocol_map.get(protocol.upper(), 0)
