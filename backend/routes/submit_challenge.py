from flask import Blueprint, request, jsonify
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import os
import requests
import json
import re

submit_challenge_bp = Blueprint("submit_challenge", __name__)

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

databases = Databases(client)

DB_ID = os.getenv("APPWRITE_DATABASE_ID")
DOCS_COLLECTION_ID = os.getenv("APPWRITE_DOCS_COLLECTION_ID")
SUBMISSIONS_COLLECTION_ID = os.getenv("APPWRITE_SUMBMIT_CHALLENGE_COLLECTION_ID")
PROGRESS_COLLECTION_ID = os.getenv("APPWRITE_USER_PROGRESS_COLLECTION_ID")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

BACKEND_URL = os.getenv("BACKEND_URL")


def extract_json_from_text(text):
    try:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return None


def clean_feedback(feedback_raw):
    feedback_text = str(feedback_raw).strip()

    if feedback_text.startswith("```") and feedback_text.endswith("```"):
        feedback_text = "\n".join(feedback_text.split("\n")[1:-1]).strip()

    try:
        parsed_json = json.loads(feedback_text)
        feedback_value = parsed_json.get("feedback", None)
        if isinstance(feedback_value, dict):
            feedback_text = json.dumps(feedback_value)
        elif feedback_value is not None:
            feedback_text = str(feedback_value)
    except Exception:
        pass

    return feedback_text or "No feedback provided."


@submit_challenge_bp.route("/submit_challenge", methods=["POST"])
def submit_challenge():
    try:
        data = request.json
        user_id = data.get("user_id")
        doc_id = data.get("doc_id")
        user_solution = data.get("user_solution")

        if not user_id or not doc_id or not user_solution:
            return jsonify({"error": "Missing required fields"}), 400

        # 1) Fetch challenge text
        challenge_doc = databases.get_document(DB_ID, DOCS_COLLECTION_ID, doc_id)
        challenge_text = challenge_doc.get("challenges", "")
        if not challenge_text:
            return jsonify({"error": "Challenge text not found"}), 404

        # 2) Build Gemini prompt
        prompt = f"""
Challenge:
{challenge_text}

User Solution:
{user_solution}

Please evaluate the user's solution.
Respond in the format:
{{
  "success": true/false,
  "feedback": "<short feedback text>",
  "xp": <integer 0-10>
}}
"""

        # 3) Call Gemini API
        response = requests.post(
            f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30
        )

        if response.status_code != 200:
            return jsonify({"error": "Gemini API failed", "details": response.text}), 500

        gemini_result = response.json()
        raw_text = gemini_result["candidates"][0]["content"]["parts"][0]["text"]

        # 4) Extract JSON safely
        parsed = extract_json_from_text(raw_text)
        if parsed:
            success = parsed.get("success", False)
            xp_raw = parsed.get("xp", 0) or 0
            try:
                xp_awarded = int(str(xp_raw).strip())
            except Exception:
                xp_awarded = 0
            feedback = clean_feedback(parsed)
        else:
            success = False
            xp_awarded = 0
            feedback = clean_feedback(raw_text)

        print(f"DEBUG: XP to save: {xp_awarded} Type: {type(xp_awarded)}")
        print(f"DEBUG: Feedback type: {type(feedback)}")

        # 5) Save submission in Appwrite
        databases.create_document(
            DB_ID,
            SUBMISSIONS_COLLECTION_ID,
            ID.unique(),
            {
                "user_id": str(user_id),
                "doc_id": str(doc_id),
                "user_solution": str(user_solution),
                "feedback": str(feedback),
                "xp_awarded": int(xp_awarded)
            }
        )

        # 6) Update user progress using update_progress route
        if xp_awarded > 0:
            try:
                requests.post(
                    f"{BACKEND_URL}/api/update_progress",
                    json={
                        "user_id": user_id,
                        "xp_earned": xp_awarded,
                        "challenge_title": challenge_doc.get("title", "a challenge")
                    },
                    timeout=10
                )
            except Exception as e:
                print("Failed to call /update_progress:", str(e))

        return jsonify({
            "feedback": str(feedback),
            "xp_awarded": int(xp_awarded),
            "success": bool(success)
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()  
        return jsonify({"error": str(e)}), 500
