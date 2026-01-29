"""
Vision service stub: returns fixed detections for Phase 1 integration.
Replace with real detection/recognition later.
"""
import uuid
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Parts Vision Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    # Stub: one recognized, one unrecognized with guidance
    return {
        "detections": [
            {
                "detectionId": str(uuid.uuid4()),
                "imageIndex": 0,
                "boundingBox": {"x": 50, "y": 60, "w": 120, "h": 90},
                "recognized": True,
                "partId": "stub-part-1",
                "sizeVariantId": "stub-size-1",
                "confidence": 0.95,
            },
            {
                "detectionId": str(uuid.uuid4()),
                "imageIndex": 0,
                "boundingBox": {"x": 220, "y": 80, "w": 100, "h": 85},
                "recognized": False,
                "confidence": 0.3,
                "guidance": "rotate",
            },
        ]
    }
