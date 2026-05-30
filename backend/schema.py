from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Dict, Optional


def _utc_now():
    return datetime.now(timezone.utc)


# --- Response Schema ---
# This guarantees our API always returns this exact structure to React
class PredictionResponse(BaseModel):
    status: str
    record_id: str
    prediction: str
    confidence: float
    heatmap_url: str
    original_url: str

# --- Database Record Schema ---
# This guarantees we never save messy or incomplete data to MongoDB
class DiagnosticRecordSchema(BaseModel):
    timestamp: datetime = Field(default_factory=_utc_now)
    original_image_url: str
    heatmap_image_url: str
    prediction: str
    confidence_score: float
    probabilities: Dict[str, float]
    model_variant: str = "DenseNet121_v1"
    physician_override: Optional[bool] = None
    
    

class OverrideRequest(BaseModel):
    physician_override: bool
    notes: Optional[str] = None