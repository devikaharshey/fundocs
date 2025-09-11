from flask import Blueprint, request, jsonify
import requests
import os
import json
import re
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
DOCS_COLLECTION_ID = os.getenv("APPWRITE_DOCS_COLLECTION_ID")

generate_all_bp = Blueprint("generate_all", __name__)

# Initialize Appwrite client
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)
databases = Databases(client)


@generate_all_bp.route("/generate_all", methods=["POST"])
def generate_all():
    data = request.json
    text = data.get("text", "")
    user_id = data.get("userId")
    doc_id = data.get("docId")

    if not text or not user_id or not doc_id:
        return jsonify({"error": "Missing text, userId or docId"}), 400

    doc_content = text.strip()

    prompt = f"""
You are an AI tutor. Analyze the following documentation carefully.

### TASKS

1. **STORY**
   - Convert the documentation into an engaging story as if teaching a beginner.
   - Keep it fun, clear, and use analogies when possible.
   - Mark section with `### STORY`.

2. **STEPS**
   - Explain the concept step by step, like a guided walkthrough.
   - Each step must be short, crisp, and easy to follow.
   - Mark section with `### STEPS`.

3. **CHALLENGES**
   - Create exactly 3 challenges (coding tasks, quiz-style, or thought exercises).
   - Each challenge must end with the phrase `Challenge Ended`.
   - Format:
     Challenge 1: ...
     Challenge Ended
     Challenge 2: ...
     Challenge Ended
     Challenge 3: ...
     Challenge Ended
   - Mark section with `### CHALLENGES`.

4. **FLASHCARDS**
   - Generate 4–5 flashcards in strict JSON format.
   - Example:
     [
       {{"question": "What is X?", "answer": "X is ..."}},
       {{"question": "How does Y work?", "answer": "Y works by ..."}}
     ]
   - Do not include any text outside the JSON.
   - Mark section with `### FLASHCARDS`.

Documentation:
{doc_content}
"""

    try:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        resp = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30
        )

        if resp.status_code != 200:
            print("Gemini returned non-200:", resp.status_code, resp.text)
            return jsonify({"error": f"Gemini API error: {resp.status_code}"}), 503

        try:
            resp_json = resp.json()
            content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            print("Gemini response parse error:", resp.text)
            return jsonify({"error": "Invalid response from Gemini"}), 503

        def extract_section(title):
            pattern = rf"### {title}\s*(.*?)(?=###|$)"
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            return match.group(1).strip() if match else ""

        story = extract_section("STORY")
        steps_raw = extract_section("STEPS")
        challenges = extract_section("CHALLENGES")
        flashcards_raw = extract_section("FLASHCARDS")

        # Steps → list
        steps = [s.strip("-*0123456789. ") for s in steps_raw.split("\n") if s.strip()]

        # Flashcards → JSON parsing
        flashcards_clean = flashcards_raw.strip()
        if flashcards_clean.startswith("```"):
            flashcards_clean = re.sub(r"^```[a-zA-Z0-9]*\s*", "", flashcards_clean)
            flashcards_clean = re.sub(r"```$", "", flashcards_clean.strip())

        try:
            flashcards = json.loads(flashcards_clean)
        except Exception as e:
            print("Flashcards parse error:", e)
            flashcards = []

        updated_doc = databases.update_document(
            database_id=DATABASE_ID,
            collection_id=DOCS_COLLECTION_ID,
            document_id=doc_id,
            data={
                "story": story,
                "slider": "\n".join(steps),
                "challenges": challenges,
                "flashcards": json.dumps(flashcards),
            },
        )

        return jsonify({
            "doc": updated_doc,
            "story": story,
            "steps": steps,
            "challenges": challenges,
            "flashcards": flashcards,
        }), 200

    except requests.exceptions.RequestException as e:
        print("Gemini request error:", e)
        return jsonify({"error": "Failed to contact Gemini API"}), 503

    except Exception as e:
        print("Generate All error:", e)
        return jsonify({"error": str(e)}), 500
