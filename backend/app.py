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
load_dotenv(override=True)

print("API KEY FOUND:", bool(os.getenv("OPENAI_API_KEY")))

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
        resume_skills = extract_skills(text)
        analysis_result = analyze_skills(resume_skills, job_role)
        return jsonify(analysis_result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================
# 🎤 INTERVIEW SIMULATION ROUTE
# ============================
@app.route("/interview", methods=["POST"])
def interview():
    data = request.json or {}
    job_role = data.get("jobRole", "Software Engineer")
    messages = data.get("messages", [])

    if len(messages) == 0:
        return jsonify({
            "reply": (
                f"Welcome to your {job_role} interview.\n"
                "First question: Can you briefly introduce yourself?"
            )
        })

    clean_messages = [
        m for m in messages
        if isinstance(m, dict)
        and m.get("role")
        and m.get("content")
        and isinstance(m.get("content"), str)
    ]

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
        response = client.responses.create(
            model="gpt-5-nano",
            input=full_messages
        )

        reply = response.output_text
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


# ============================
# 🤖 STUDY ASSISTANT ROUTE
# ============================
@app.route("/study-assistant", methods=["POST"])
def study_assistant():
    data = request.json or {}
    messages = data.get("messages", [])

    clean_messages = [
        m for m in messages
        if isinstance(m, dict)
        and m.get("role")
        and m.get("content")
        and isinstance(m.get("content"), str)
    ]

    full_messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful AI study assistant. "
                "Explain concepts clearly and practically and concise. "
                "Do NOT conduct interviews. "
                "Do NOT ask structured interview questions. "
                "Give direct helpful answers."
            ),
        }
    ] + clean_messages

    try:
        response = client.responses.create(
            model="gpt-5-nano",
            input=full_messages
        )

        reply = response.output_text
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================
# 📅 HIRING CALENDAR ROUTE
# ============================
@app.route("/hiring-calendar", methods=["GET"])
def hiring_calendar():
    try:
        data_path = os.path.join("utils", "hiring_calendar.json")

        if not os.path.exists(data_path):
            return jsonify({"error": "hiring_calendar.json not found"}), 404

        with open(data_path, "r", encoding="utf-8") as f:
            calendar_data = json.load(f)

        return jsonify({"calendar": calendar_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================
# ▶️ RUN SERVER
# ============================
if __name__ == "__main__":
    app.run(debug=True)
