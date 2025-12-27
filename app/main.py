from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.ingestion import extract_text_from_pdf, ingest_resume
from app.services.reasoning_engine import analyze_match
from app.services.search import search_candidates

app = FastAPI(title="Ema Talent Orchestration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MatchRequest(BaseModel):
    candidate_profile: str
    job_description: str


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(file: UploadFile) -> dict:
    temp_path = f"/tmp/{file.filename}"
    content = await file.read()
    with open(temp_path, "wb") as temp_file:
        temp_file.write(content)

    chunks = ingest_resume(temp_path)
    return {"chunks": len(chunks)}


@app.post("/extract-text")
async def extract_text(file: UploadFile) -> dict:
    temp_path = f"/tmp/{file.filename}"
    content = await file.read()
    with open(temp_path, "wb") as temp_file:
        temp_file.write(content)

    text = extract_text_from_pdf(temp_path)
    return {"filename": file.filename, "text": text}


@app.post("/search")
async def search(payload: dict) -> dict:
    job_description = payload.get("job_description", "")
    matches = search_candidates(job_description)
    serialized = [
        {"text": match[0], "score": match[1]} for match in matches
    ]
    return {"results": serialized}


@app.post("/api/match")
async def match(request: MatchRequest) -> dict:
    """Generate an explainable match analysis between a candidate and a job description."""

    result = analyze_match(
        candidate_profile=request.candidate_profile,
        job_description=request.job_description,
    )
    return result
