from flask import Blueprint, request, jsonify
from bs4 import BeautifulSoup
import requests
import validators
from datetime import datetime
from dotenv import load_dotenv
import os
from appwrite.query import Query
from appwrite.client import Client
from appwrite.services.databases import Databases
import requests as pyrequests  

load_dotenv()

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
DOCS_COLLECTION_ID = os.getenv("APPWRITE_DOCS_COLLECTION_ID")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX_ID = os.getenv("GOOGLE_CX_ID")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

PROGRESS_SERVICE_URL = f"{BACKEND_URL}/api/update_progress"

fetch_clean_doc_bp = Blueprint("fetch_clean_doc", __name__)
fetch_user_docs_bp = Blueprint("fetch_user_docs", __name__)

# Initialize Appwrite client
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)
databases = Databases(client)


def clean_text_from_url(url: str) -> str:
    resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    text = " ".join(soup.stripped_strings)

    # Detect Cloudflare
    if "Just a moment" in text or "Verifying you are human" in text:
        raise Exception("Cloudflare protection detected")

    return text[:1000000]


# Fallback method using Google Custom Search API
def fetch_via_google_cse(query: str) -> str:
    api_url = (
        f"https://www.googleapis.com/customsearch/v1?q={query}"
        f"&key={GOOGLE_API_KEY}&cx={GOOGLE_CX_ID}"
    )
    resp = requests.get(api_url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if "items" not in data:
        return "No results found via Google Search."

    snippets = [item.get("snippet", "") for item in data["items"]]
    return " ".join(snippets)[:1000000]


def award_xp(user_id: str, amount: int):
    try:
        res = pyrequests.post(PROGRESS_SERVICE_URL, json={
            "user_id": user_id,
            "xp_earned": amount
        }, timeout=5)
        if res.status_code != 200:
            print("⚠️ Failed to award XP:", res.text)
    except Exception as e:
        print("⚠️ Error contacting progress service:", e)


@fetch_clean_doc_bp.route("/fetch_clean_doc", methods=["POST"])
def fetch_clean_doc():
    data = request.json
    source = data.get("source")
    user_id = data.get("userId")

    if not source:
        return jsonify({"error": "No input provided"}), 400
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        if validators.url(source):
            try:
                cleaned = clean_text_from_url(source)
                title = source.split("/")[-1][:50] or "Untitled Doc"
            except Exception as e:
                cleaned = fetch_via_google_cse(source)
                title = "GoogleSearch-" + source.split("/")[-1][:50]
        else:
            cleaned = source.strip()
            title = " ".join(cleaned.split(" ")[:5])[:50] or "Untitled Doc"
    except Exception as e:
        return jsonify({"error": f"Failed to process source: {str(e)}"}), 400

    doc_data = {
        "title": title,
        "text": cleaned,
        "createdBy": user_id,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "story": "",
        "slider": "",
        "challenges": "",
        "flashcards": "",
    }

    try:
        created_doc = databases.create_document(
            database_id=DATABASE_ID,
            collection_id=DOCS_COLLECTION_ID,
            document_id="unique()",
            data=doc_data,
        )

        award_xp(user_id, 1)

        return jsonify({"doc": created_doc}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to create document: {str(e)}"}), 500
    

@fetch_user_docs_bp.route("/fetch_user_docs", methods=["GET"])
def fetch_user_docs():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    try:
        docs_resp = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id=DOCS_COLLECTION_ID,
            queries=[Query.equal("createdBy", user_id)]
        )

        docs = []
        for doc in docs_resp.get("documents", []):
            docs.append({
                "$id": doc.get("$id"),
                "title": doc.get("title"),
                "text": doc.get("text"),
                "story": doc.get("story", ""),
                "steps": doc.get("slider", ""),  
                "challenges": doc.get("challenges", ""),
                "flashcards": doc.get("flashcards", ""),
                "createdAt": doc.get("createdAt"),
            })

        return jsonify({"docs": docs}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
