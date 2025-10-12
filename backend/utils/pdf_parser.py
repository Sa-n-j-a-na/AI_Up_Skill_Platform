import PyPDF2

def extract_text_from_pdf(file):
    pdfReader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdfReader.pages:
        text += page.extract_text() + " "
    return text.strip()
