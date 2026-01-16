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

app = Flask(__name__)
CORS(app)

# 🔑 Load environment variables
load_dotenv()
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

    # --- DEBUG PRINT (SAFE PLACE) ---
    print("\n=== DEBUG INFO ===")
    print("Job Role:", job_role)
    print("Resume Skills:", resume_skills)
    print("Required Skills:", analysis_result["requiredSkills"])
    print("Missing Skills:", analysis_result["missingSkills"])
    print("===================\n")

    # ✅ RETURN RESULT (THIS WAS MISSING)
    return jsonify(analysis_result)


# ============================
# 🎤 INTERVIEW SIMULATION ROUTE
# ============================
@app.route("/interview", methods=["POST"])
def interview():
    data = request.json
    job_role = data.get("jobRole", "Software Engineer")
    messages = data.get("messages", [])

    # FIRST question (when interview starts)
    if len(messages) == 0:
        return jsonify({
            "reply": (
                f"Welcome to your {job_role} interview. "
                "First question: Can you briefly introduce yourself?"
            )
        })

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
    ] + messages

    try:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=full_messages,
            temperature=0.7,
        )

        reply = response.choices[0].message.content

        return jsonify({"reply": reply})

    except Exception as e:
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


if __name__ == "__main__":
    app.run(debug=True)
