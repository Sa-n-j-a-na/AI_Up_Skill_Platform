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

load_dotenv(override=True)

print("OPENAI KEY FOUND:", bool(os.getenv("OPENAI_API_KEY")))
print("JSEARCH KEY FOUND:", bool(os.getenv("JSEARCH_API_KEY")))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DATA_PATH = os.path.join("utils", "job_skills_data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    JOB_SKILLS_DATA = json.load(f)


# ============================
# 🎭 PERSONA SYSTEM PROMPTS
# ============================
PERSONA_PROMPTS = {

    "friendly": """
You are a warm, supportive interviewer for the role of {job_role}.

Your job is to ask ONE interview question at a time and then evaluate the candidate's answer.

After each answer, you MUST follow this exact structure — no exceptions:

✅ Strength: [Point out one genuine positive thing about their answer, be encouraging]
💡 Improvement: [Give one specific, kind suggestion to improve the answer]

Then decide:
- If the answer was SATISFACTORY (shows basic understanding, even if imperfect): say "Great effort! Let's move on." then ask the NEXT interview question.
- If the answer was UNSATISFACTORY (too vague, off-topic, very incomplete, or just "I don't know"): say "That's okay, let's try again! 😊" then REPEAT THE SAME QUESTION with a gentle hint to help them.

Never skip the feedback format. Never move on from an unsatisfactory answer.
Be warm, patient and encouraging throughout.
""",

    "balanced": """
You are a professional, fair interviewer for the role of {job_role}.

Your job is to ask ONE interview question at a time and then evaluate the candidate's answer.

After each answer, you MUST follow this exact structure — no exceptions:

✅ Strength: [Identify one clear strength in their answer]
💡 Improvement: [Give one specific, actionable suggestion to strengthen the answer]

Then decide:
- If the answer was SATISFACTORY (demonstrates reasonable understanding of the topic): say "Good. Moving to the next question." then ask the NEXT interview question.
- If the answer was UNSATISFACTORY (too brief, missing key concepts, unclear, or irrelevant): say "Let's revisit this question." then REPEAT THE SAME QUESTION. Do not provide the answer — just ask them to try again with better depth.

Never skip the feedback format. Never move on from an unsatisfactory answer.
Maintain a professional, neutral tone throughout.
""",

    "strict": """
You are a rigorous, demanding senior interviewer for the role of {job_role}.

Your job is to ask ONE tough interview question at a time and critically evaluate the candidate's answer.

After each answer, you MUST follow this exact structure — no exceptions:

✅ Strength: [Acknowledge only what was genuinely correct or strong — be brief and direct]
💡 Improvement: [Give one sharp, specific criticism pointing out exactly what was missing or weak]

Then decide:
- If the answer was SATISFACTORY (shows solid understanding with specifics and depth): say "Acceptable. Next question." then ask the NEXT, HARDER interview question.
- If the answer was UNSATISFACTORY (vague, shallow, missing key technical depth, or incorrect): say "That answer is insufficient. Try again." then REPEAT THE SAME QUESTION with no hints. Expect a better answer.

Never skip the feedback format. Never move on from an unsatisfactory answer.
Be direct, critical, and maintain high standards. Do not soften your feedback.
"""
}

DEFAULT_PERSONA = "balanced"


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
    persona  = data.get("persona", DEFAULT_PERSONA)
    messages = data.get("messages", [])

    # ── Welcome message on first load (no messages yet) ──
    if len(messages) == 0:
        welcome_map = {
            "friendly": (
                f"Welcome! 😊 I'm so excited to interview you for the {job_role} role today. "
                "This is a safe space — take your time and answer naturally. "
                "I'll give you feedback after every answer and we'll work through each question together.\n\n"
                "Let's begin! Here's your first question:\n\n"
                "Can you briefly introduce yourself and tell me why you're interested in this role?"
            ),
            "balanced": (
                f"Welcome to your {job_role} interview.\n\n"
                "After each answer you'll receive structured feedback — a strength and an improvement point. "
                "If your answer needs more depth, I'll ask you to try again before we move on.\n\n"
                "First question:\n\n"
                "Can you briefly introduce yourself and explain what draws you to this role?"
            ),
            "strict": (
                f"This is your {job_role} interview. Rules are simple: answer clearly, with depth and precision. "
                "You will receive feedback after every answer. "
                "If your answer is insufficient, you will be asked to try again — no exceptions.\n\n"
                "First question:\n\n"
                "Introduce yourself. Justify why you are a strong candidate for this role."
            ),
        }
        return jsonify({
            "reply": welcome_map.get(persona, welcome_map[DEFAULT_PERSONA])
        })

    # ── Clean message history ──
    clean_messages = [
        m for m in messages
        if isinstance(m, dict)
        and m.get("role")
        and m.get("content")
        and isinstance(m.get("content"), str)
    ]

    # ── Build persona system prompt ──
    persona_template = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS[DEFAULT_PERSONA])
    system_prompt = persona_template.format(job_role=job_role)

    full_messages = [
        {"role": "system", "content": system_prompt}
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
# 📅 HIRING CALENDAR ROUTE
# ============================
@app.route("/hiring-calendar", methods=["GET"])
def hiring_calendar():
    try:
        role = request.args.get("role", "software developer")
        JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")

        if not JSEARCH_API_KEY:
            return jsonify({"error": "JSEARCH_API_KEY not found"}), 500

        url = "https://jsearch.p.rapidapi.com/search"
        headers = {
            "X-RapidAPI-Key": JSEARCH_API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        querystring = {
            "query": f"{role} OR {role} internship OR {role} fresher",
            "country": "IN",
            "remote_jobs_only": "true",
            "page": "1",
            "num_pages": "1"
        }

        response = requests.get(url, headers=headers, params=querystring, timeout=60)
        data = response.json()
        jobs = data.get("data", [])[:30]
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
            currency   = job.get("job_salary_currency")
            period     = job.get("job_salary_period")

            if min_salary and max_salary:
                salary = f"{currency} {min_salary:,} - {max_salary:,} / {period}"
            elif min_salary:
                salary = f"{currency} {min_salary:,} / {period}"
            else:
                salary = "Not disclosed"

            job_entry = {
                "company":    job.get("employer_name"),
                "role":       job.get("job_title"),
                "location":   job.get("job_city") or "Remote",
                "category":   job.get("job_employment_type"),
                "salary":     salary,
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