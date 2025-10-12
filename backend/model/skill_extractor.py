import spacy
import json
import os
import re
from sentence_transformers import SentenceTransformer, util

# ===== Load Models =====
nlp = spacy.load("en_core_web_sm")

# Load fine-tuned SBERT model
bert_model = SentenceTransformer(
    os.path.join(os.path.dirname(__file__), "models/skill_sbert")
)

# ===== Load Job Skills =====
DATA_PATH = os.path.join(os.path.dirname(__file__), "../utils/job_skills_data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    JOB_SKILLS_DATA = json.load(f)

# Flatten all skills into one list
ALL_SKILLS = list(set(skill for skills in JOB_SKILLS_DATA.values() for skill in skills))

# ===== Helper Functions =====
def normalize(text: str):
    """
    Lowercase, remove spaces and dots for comparison.
    Keep special chars like + and # for C++ / C#.
    """
    text = text.lower()
    text = text.replace(" ", "").replace(".", "")
    text = re.sub(r'[^a-z0-9#+]', '', text)
    return text

def text_matches_skill(resume_text, skill):
    """
    Check if a skill exists in the resume text.
    Handles:
      - Single-letter skills like C or R
      - Multi-letter skills
      - Special char skills like C# and C++
      - Multi-word skills like Node JS / Node.js
    """
    resume_norm = normalize(resume_text)
    skill_norm = normalize(skill)

    # Single-letter skills: match as whole word
    if len(skill) == 1:
        pattern = r'(?i)(?<!\w)' + re.escape(skill) + r'(?!\w)'
        return re.search(pattern, resume_text) is not None

    # Skills with special chars: match as whole word
    if re.search(r'[^a-zA-Z0-9]', skill):
        pattern = r'(?i)\b' + re.escape(skill) + r'\b'
        return re.search(pattern, resume_text) is not None

    # Multi-word or normal skills: match in normalized text
    return skill_norm in resume_norm

# ===== Main Skill Extractor =====
def extract_skills(resume_text: str):
    """
    Extract skills from resume text using:
    1. Candidate token extraction (Spacy tokens, noun chunks, entities)
    2. Fine-tuned SBERT embeddings + cosine similarity
    3. Normalized matching to avoid false positives
    """
    # Split CamelCase (e.g., JestAngular -> Jest Angular)
    resume_text = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', resume_text)

    # Step 1: Candidate token extraction
    doc = nlp(resume_text)
    candidates = set()

    for token in doc:
        if token.is_alpha or re.match(r'[A-Za-z0-9#+]+', token.text):
            if len(token.text) > 1:
                candidates.add(token.text)
    for chunk in doc.noun_chunks:
        candidates.add(chunk.text)
    for ent in doc.ents:
        candidates.add(ent.text)

    # Normalize candidates for embeddings
    candidates = list(set(normalize(c) for c in candidates))
    skills_norm = [normalize(s) for s in ALL_SKILLS]

    # Step 2: Encode embeddings
    cand_embeddings = bert_model.encode(candidates, convert_to_tensor=True)
    skill_embeddings = bert_model.encode(skills_norm, convert_to_tensor=True)
    sim_matrix = util.cos_sim(cand_embeddings, skill_embeddings)

    # Step 3: Find skills using similarity + normalized matching
    found_skills = set()
    for i, cand in enumerate(candidates):
        max_idx = int(sim_matrix[i].argmax())
        max_sim = float(sim_matrix[i][max_idx])
        skill_text = ALL_SKILLS[max_idx]
        if max_sim >= 0.65 and text_matches_skill(resume_text, skill_text):
            found_skills.add(skill_text)

    # Step 4: Final fallback: direct normalized substring match for any missing skills
    for skill in ALL_SKILLS:
        if text_matches_skill(resume_text, skill):
            found_skills.add(skill)

    return sorted(found_skills)

# ===== Optional: Missing Job Skills Function =====
def missing_skills(resume_text: str, required_skills: list):
    """
    Returns list of skills from 'required_skills' not present in resume
    """
    extracted = extract_skills(resume_text)
    missing = [s for s in required_skills if normalize(s) not in [normalize(e) for e in extracted]]
    return missing
