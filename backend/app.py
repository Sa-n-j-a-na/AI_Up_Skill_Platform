from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.pdf_parser import extract_text_from_pdf
from model.skill_extractor import extract_skills
from model.skill_analyzer import analyze_skills
from model.learning_path_gen import generate_learning_path
import os
import json
import requests
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

# ============================
# 🚀 APP SETUP
# ============================
app = Flask(__name__)
CORS(app)

# 🔑 Load environment variables
load_dotenv(override=True)

print("OPENAI KEY FOUND:", bool(os.getenv("OPENAI_API_KEY")))
print("JSEARCH KEY FOUND:", bool(os.getenv("JSEARCH_API_KEY")))

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
                "Explain concepts clearly and concisely in a proper structure. "
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
# 📅 FAST INDIA + REMOTE HIRING CALENDAR
# ============================
@app.route("/hiring-calendar", methods=["GET"])
def hiring_calendar():
    try:
        import requests
        from datetime import datetime

        role = request.args.get("role", "software developer")

        JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")

        if not JSEARCH_API_KEY:
            return jsonify({"error": "JSEARCH_API_KEY not found"}), 500

        url = "https://jsearch.p.rapidapi.com/search"

        headers = {
            "X-RapidAPI-Key": JSEARCH_API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }

        # 🔥 SINGLE FAST QUERY
        querystring = {
            "query": f"{role} OR {role} internship OR {role} fresher",
            "country": "IN",
            "remote_jobs_only": "true",
            "page": "1",
            "num_pages": "1"
        }

        response = requests.get(url, headers=headers, params=querystring, timeout=60)
        data = response.json()

        jobs = data.get("data", [])[:30]  # 🔥 limit results for speed

        calendar = {}

        for job in jobs:
            posted_date = job.get("job_posted_at_datetime_utc")
            if not posted_date:
                continue

            try:
                date_obj = datetime.fromisoformat(posted_date.replace("Z", ""))
                month_name = date_obj.strftime("%B")
            except:
                continue

            min_salary = job.get("job_min_salary")
            max_salary = job.get("job_max_salary")
            currency = job.get("job_salary_currency")
            period = job.get("job_salary_period")

            if min_salary and max_salary:
                salary = f"{currency} {min_salary:,} - {max_salary:,} / {period}"
            elif min_salary:
                salary = f"{currency} {min_salary:,} / {period}"
            else:
                salary = "Not disclosed"

            job_entry = {
                "company": job.get("employer_name"),
                "role": job.get("job_title"),
                "location": job.get("job_city") or "Remote",
                "category": job.get("job_employment_type"),
                "salary": salary,
                "apply_link": job.get("job_apply_link")
            }

            calendar.setdefault(month_name, []).append(job_entry)

        return jsonify({"calendar": calendar})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================
# ▶️ RUN SERVER
# ============================
if __name__ == "__main__":
    app.run(debug=True)
