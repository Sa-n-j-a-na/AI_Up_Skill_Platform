# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.parser import parse_resume_bytes
from app.linkedin_parser import parse_linkedin_bytes
import uvicorn

app = FastAPI(title="SkillGap MVP API")

# Allow frontend (Streamlit/React dev) to call backend during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf",)):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resume parsing.")
    contents = await file.read()
    try:
        result = parse_resume_bytes(contents)
        return JSONResponse(content={"type": "resume", "parsed": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {e}")

@app.post("/parse_linkedin")
async def parse_linkedin(file: UploadFile = File(...)):
    # accept JSON or CSV (CSV basic handling)
    filename = file.filename.lower()
    contents = await file.read()
    try:
        parsed = parse_linkedin_bytes(contents, filename)
        return JSONResponse(content={"type": "linkedin", "parsed": parsed})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LinkedIn parse failed: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
