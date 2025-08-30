# Backend (FastAPI) - SkillGap MVP

cd backend
## Install
python -m venv venv
source venv/Scripts/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

## Run
uvicorn main:app --reload --port 8000

## Endpoints
GET  /health
POST /parse_resume    (file: PDF)
POST /parse_linkedin  (file: JSON or CSV)
