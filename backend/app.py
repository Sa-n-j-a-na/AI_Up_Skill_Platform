from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.pdf_parser import extract_text_from_pdf
from model.skill_extractor import extract_skills
from model.skill_analyzer import analyze_skills
import os
import json

app = Flask(__name__)
CORS(app)

# ✅ Load job skills dataset once
DATA_PATH = os.path.join("utils", "job_skills_data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    JOB_SKILLS_DATA = json.load(f)

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files or "job_role" not in request.form:
        return jsonify({"error": "Missing file or job_role"}), 400

    file = request.files["file"]
    job_role = request.form["job_role"]

    try:
        text = extract_text_from_pdf(file)
    except Exception as e:
        return jsonify({"error": f"PDF extraction failed: {str(e)}"}), 500

    try:
        resume_skills = extract_skills(text)
    except Exception as e:
        return jsonify({"error": f"Skill extraction failed: {str(e)}"}), 500

    # ✅ Use SBERT-based analyzer for proper fuzzy matching
    analysis_result = analyze_skills(resume_skills, job_role)

    # --- DEBUG PRINT ---
    print("\n=== DEBUG INFO ===")
    print("Job Role:", job_role)
    print("Resume Skills:", resume_skills)
    print("Required Skills:", analysis_result["requiredSkills"])
    print("Missing Skills:", analysis_result["missingSkills"])
    print("===================\n")

    return jsonify(analysis_result)

if __name__ == "__main__":
    app.run(debug=True)
