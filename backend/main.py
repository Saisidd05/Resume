"""
At Your Hand — FastAPI Application Entry Point

Template-preserving resume builder backend.
TEMPLATE IN = TEMPLATE OUT.
"""
from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import parse, generate, ai

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── App init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="At Your Hand — Resume Builder API",
    description=(
        "Template-preserving resume builder. "
        "TEMPLATE IN = TEMPLATE OUT. "
        "Upload a PDF or DOCX template, answer questions, get your resume."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow frontend dev server ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(parse.router)
app.include_router(generate.router)
app.include_router(ai.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "at-your-hand-api", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "message": "At Your Hand Resume Builder API",
        "docs": "/docs",
        "endpoints": {
            "parse": "POST /api/parse",
            "generate": "POST /api/generate",
            "ai_suggest": "POST /api/ai/suggest",
            "ai_status": "GET /api/ai/status",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
