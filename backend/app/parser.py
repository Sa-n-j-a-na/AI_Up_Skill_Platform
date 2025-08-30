# backend/app/parser.py
# Minimal PDF -> text parser using PyMuPDF (fitz)
import fitz  # PyMuPDF

def parse_resume_bytes(pdf_bytes: bytes) -> dict:
    """
    Extract text from PDF bytes and do very simple structure detection.
    Returns: dict with 'text' and simple 'sections' (best-effort)
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise RuntimeError("Unable to open PDF: " + str(e))

    full_text = []
    for page in doc:
        text = page.get_text("text")
        if text:
            full_text.append(text)
    raw = "\n".join(full_text).strip()

    # Very simple "section" splitting: split on common headings
    sections = {}
    lowered = raw.lower()
    # naive finds
    for heading in ("education", "experience", "skills", "projects", "summary", "certifications"):
        if heading in lowered:
            # find index
            idx = lowered.find(heading)
            snippet = raw[idx: idx + 1000]  # extract chunk starting at heading
            sections[heading] = snippet.splitlines()[:20]  # small slice

    result = {
        "text": raw,
        "sections_preview": sections
    }
    return result
