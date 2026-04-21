"""
Inference pipeline. Replace mock `run_inference` / `extract_metrics` with real
model calls (e.g. YOLO) without changing the FastAPI contract.
"""

from __future__ import annotations

import random
from typing import Any

_models_loaded = False


def load_models() -> None:
    """
    Load ML models once at startup.

    Later: instantiate canopy_model, fruit_model, leaf_model and cache on this module.
    """
    global _models_loaded
    _models_loaded = True


def extract_metrics(raw: dict[str, Any]) -> dict[str, float]:
    """
    Map raw model outputs to Growloc API fields.

    Later: derive canopy_height / width / area from tensors, geometry, or heuristics.
    """
    _ = raw  # placeholder — real outputs will replace random metrics
    return {
        "canopy_height": round(random.uniform(0.15, 2.8), 3),
        "canopy_width": round(random.uniform(0.2, 3.5), 3),
        "canopy_area": round(random.uniform(0.05, 10.0), 3),
    }


def run_inference(image_bytes: bytes) -> dict[str, Any]:
    """
    Run the full inference stack for one image.

    Later: decode image, run canopy/fruit/leaf models, return structured raw dict.
    """
    if not _models_loaded:
        load_models()

    raw: dict[str, Any] = {
        "byte_length": len(image_bytes),
        "mock": True,
    }
    metrics = extract_metrics(raw)
    return metrics
