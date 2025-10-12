# skill_analyzer.py
import os
import json
import numpy as np
import re
import torch
from sentence_transformers import SentenceTransformer, util

# ===== Paths =====
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "../utils/job_skills_data.json")
MODEL_PATH = os.path.join(BASE_DIR, "models/skill_sbert")

# ===== Load Job Skills =====
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Job skills JSON not found at {DATA_PATH}")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    JOB_SKILLS_DATA = json.load(f)

# ===== Load fine-tuned SBERT model =====
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"SBERT model not found at {MODEL_PATH}")
bert_model = SentenceTransformer(MODEL_PATH)

# ===== Text Normalization =====
def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)  # remove punctuation/dots
    text = re.sub(r'\s+', '', text).strip()   # remove spaces completely
    return text

# ===== Main Skill Analyzer =====
def analyze_skills(resume_skills, job_role, threshold=0.60):
    role_key = normalize_text(job_role)
    required_skills = JOB_SKILLS_DATA.get(role_key, [])

    if not required_skills:
        return {
            "requiredSkills": [],
            "resumeSkills": resume_skills,
            "missingSkills": [],
            "score": 0
        }

    # Normalize both lists
    resume_clean = [normalize_text(s) for s in resume_skills]
    required_clean = [normalize_text(s) for s in required_skills]

    # Encode resume skills once
    resume_embeddings = bert_model.encode(resume_clean, convert_to_tensor=True)

    missing_skills = []
    matched_count = 0

    for i, req_skill in enumerate(required_skills):
        req_vec = bert_model.encode([required_clean[i]], convert_to_tensor=True)[0]
        sim_scores = util.cos_sim(req_vec, resume_embeddings)[0]

        max_sim = float(torch.max(sim_scores))
        print(f"{req_skill} → max similarity = {max_sim:.3f}")

        if max_sim < threshold:
            missing_skills.append(req_skill)
        else:
            matched_count += 1

    # ✅ Calculate percentage score
    score = int((matched_count / len(required_skills)) * 100)

    return {
        "requiredSkills": required_skills,
        "resumeSkills": resume_skills,
        "missingSkills": missing_skills,
        "score": score
    }

# ===== Example quick test =====
if __name__ == "__main__":
    resume = ["Java", "Node js", "React", "MongoDB", "HTML", "CSS"]
    job = "Full Stack Developer"
    result = analyze_skills(resume, job)
    print("\n=== Result ===")
    print(json.dumps(result, indent=2))
