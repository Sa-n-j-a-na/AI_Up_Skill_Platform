from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.pdf_parser import extract_text_from_pdf
from model.skill_extractor import extract_skills
from model.skill_analyzer import analyze_skills
from model.learning_path_gen import generate_learning_path
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# ============================
# 🚀 APP SETUP
# ============================
app = Flask(__name__)
CORS(app)

# 🔑 Load environment variables
load_dotenv()
print("API KEY FOUND:", bool(os.getenv("OPENAI_API_KEY")))
print("API KEY PREFIX:", os.getenv("OPENAI_API_KEY")[:7])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ Load job skills dataset once
DATA_PATH = os.path.join("utils", "job_skills_data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    JOB_SKILLS_DATA = json.load(f)


# ============================
# 🔍 RESUME ANALYSIS ROUTE
# ============================
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

    # ✅ Skill gap analysis
    analysis_result = analyze_skills(resume_skills, job_role)

    # --- DEBUG PRINT ---
    print("\n=== DEBUG INFO ===")
    print("Job Role:", job_role)
    print("Resume Skills:", resume_skills)
    print("Required Skills:", analysis_result["requiredSkills"])
    print("Missing Skills:", analysis_result["missingSkills"])
    print("===================\n")

    return jsonify(analysis_result)


# ============================
# 🎤 INTERVIEW SIMULATION ROUTE
# ============================
@app.route("/interview", methods=["POST"])
def interview():
    print("RAW REQUEST JSON:", request.json)

    data = request.json or {}
    job_role = data.get("jobRole", "Software Engineer")
    messages = data.get("messages", [])

    # 🟢 FIRST QUESTION (no OpenAI call)
    if len(messages) == 0:
        return jsonify({
            "reply": (
                f"Welcome to your {job_role} interview. \n"
                "First question: Can you briefly introduce yourself?"
            )
        })


    # ✅ FIX 2: FILTER INVALID / MALFORMED MESSAGES
    clean_messages = [
        m for m in messages
        if isinstance(m, dict)
        and m.get("role")
        and m.get("content")
        and isinstance(m.get("content"), str)
    ]

    # System prompt
    full_messages = [
        {
            "role": "system",
            "content": (
                f"You are a professional interviewer for the role of {job_role}. "
                "Ask ONE interview question at a time. "
                "After each answer, give short feedback "
                "(one strength + one improvement), then ask the next question."
            ),
        }
    ] + clean_messages

    try:
        # ✅ USE RESPONSES API (matches test_openai.py)
        response = client.responses.create(
            model="gpt-5-nano",
            input=full_messages
        )

        reply = response.output_text

        return jsonify({"reply": reply})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ============================
# 📘 LEARNING PATH ROUTE
# ============================
@app.route("/learning-path", methods=["POST"])
def learning_path():
    try:
        data = request.get_json()
        roadmap = generate_learning_path(data)
        return jsonify({"roadmap": roadmap})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================
# ▶️ RUN SERVER
# ============================
if __name__ == "__main__":
    app.run(debug=True)
