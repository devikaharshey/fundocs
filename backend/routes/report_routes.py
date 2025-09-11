import os
import re
import json
import requests
import textwrap
from io import BytesIO
from flask import Blueprint, request, jsonify, send_file
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

report_bp = Blueprint("report", __name__)

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))
databases = Databases(client)

DB_ID = os.getenv("APPWRITE_DATABASE_ID")
PROGRESS_COLLECTION_ID = os.getenv("APPWRITE_USER_PROGRESS_COLLECTION_ID")
SUBMISSIONS_COLLECTION_ID = os.getenv("APPWRITE_SUMBMIT_CHALLENGE_COLLECTION_ID")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def extract_json_from_text(text: str):
    """Extract first JSON object from text."""
    try:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return None

def clean_text(text):
    """Clean text for report (handles strings, lists, None)."""
    if text is None:
        return "No content available."

    if isinstance(text, list):
        text = " ".join(str(t) for t in text if t)

    text = str(text).strip()

    if text.startswith("```") and text.endswith("```"):
        text = "\n".join(text.split("\n")[1:-1]).strip()

    return text or "No content available."

@report_bp.route("/generate_report", methods=["POST"])
def generate_report():
    """
    Generates a user report based on progress and submissions.
    Returns Markdown text.
    """
    try:
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Fetch user progress
        progress_doc = databases.get_document(DB_ID, PROGRESS_COLLECTION_ID, user_id)
        xp = progress_doc.get("xp", 0)
        streak = progress_doc.get("streak", 0)

        # Fetch user challenge submissions
        submissions = databases.list_documents(
            DB_ID,
            SUBMISSIONS_COLLECTION_ID,
            queries=[Query.equal("user_id", user_id)]
        )["documents"]

        prompt = f"""
Generate a professional progress report for a user. Base it on the following data. You can add relevant emojis where appropriate, but keep it professional.

User Progress:
- XP: {xp}
- Streak: {streak}

Challenge Submissions: {json.dumps(submissions)}

Report should include:
1) Technical Knowledge
2) Communication Skills
3) Strengths
4) Areas Of Improvement
5) Overall Analysis

Return JSON:
{{
  "technical_knowledge": "...",
  "communication_skills": "...",
  "strengths": "...",
  "areas_of_improvement": "...",
  "overall_analysis": "..."
}}
"""

        response = requests.post(
            f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30
        )

        if response.status_code != 200:
            return jsonify({"error": "Gemini API failed", "details": response.text}), 500

        raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        parsed = extract_json_from_text(raw_text)

        if not parsed:
            return jsonify({"error": "Failed to parse Gemini response"}), 500

        # Convert to Markdown
        markdown_report = f"""
# User Progress Report

## 1) Technical Knowledge
{clean_text(parsed.get('technical_knowledge', 'N/A'))}

## 2) Communication Skills
{clean_text(parsed.get('communication_skills', 'N/A'))}

## 3) Strengths
{clean_text(parsed.get('strengths', 'N/A'))}

## 4) Areas Of Improvement
{clean_text(parsed.get('areas_of_improvement', 'N/A'))}

## 5) Overall Analysis
{clean_text(parsed.get('overall_analysis', 'N/A'))}
"""

        return jsonify({"report": markdown_report})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@report_bp.route("/download_report_pdf", methods=["POST"])
def download_report_pdf():
    """
    Converts Markdown report to PDF and returns it.
    """
    try:
        data = request.json
        report_text = data.get("report")
        if not report_text:
            return jsonify({"error": "Report text is required"}), 400

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        margin = 40
        y = height - margin
        font_size = 12
        line_height = font_size + 4

        c.setFont("Helvetica", font_size)

        for line in report_text.split("\n"):
            wrapped_lines = textwrap.wrap(line, width=95)
            for wrapped_line in wrapped_lines:
                if y <= margin:
                    c.showPage()
                    c.setFont("Helvetica", font_size)
                    y = height - margin
                c.drawString(margin, y, wrapped_line)
                y -= line_height

        c.save()
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name="progress_report.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
