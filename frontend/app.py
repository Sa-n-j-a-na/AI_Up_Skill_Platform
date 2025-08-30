# frontend/app.py
import streamlit as st
import requests

BACKEND_URL = st.secrets.get("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="SkillGap MVP", layout="centered")

st.title("SkillGap — Upload Resume or LinkedIn Export (MVP)")

option = st.radio("Choose input type:", ("Upload Resume (PDF)", "Upload LinkedIn JSON/CSV"))

uploaded_file = st.file_uploader("Choose file", type=("pdf", "json", "csv"))

if uploaded_file is not None:
    st.write("File:", uploaded_file.name)
    if st.button("Send to backend"):
        with st.spinner("Uploading and parsing..."):
            if option == "Upload Resume (PDF)":
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")}
                resp = requests.post(f"{BACKEND_URL}/parse_resume", files=files)
            else:
                # LinkedIn
                # content type guess:
                ctype = "application/json" if uploaded_file.name.lower().endswith(".json") else "text/csv"
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), ctype)}
                resp = requests.post(f"{BACKEND_URL}/parse_linkedin", files=files)

            if resp.status_code == 200:
                data = resp.json()
                st.success("Parsed successfully.")
                st.json(data)
            else:
                st.error(f"Error from backend: {resp.status_code} - {resp.text}")
