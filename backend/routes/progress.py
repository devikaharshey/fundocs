import os
import json
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.permission import Permission
from appwrite.role import Role
from dotenv import load_dotenv
import time

load_dotenv()

progress_bp = Blueprint("progress", __name__)

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT")) \
      .set_project(os.getenv("APPWRITE_PROJECT_ID")) \
      .set_key(os.getenv("APPWRITE_API_KEY"))

db = Databases(client)
USER_PROGRESS_COLLECTION = os.getenv("APPWRITE_USER_PROGRESS_COLLECTION_ID")
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")

BADGE_RULES = [
    # 🎯 Streak
    {"name": "Consistency Champ", "streak": 5},        # 5-day streak
    {"name": "Streak Star", "streak": 10},             # 10-day streak
    {"name": "Streak Legend", "streak": 30},           # 30-day streak
    {"name": "Unstoppable", "streak": 100},            # 100-day streak

    # ⚡ XP
    {"name": "Layout Sprout", "xp": 10},               # First 10 XP
    {"name": "Progress Pioneer", "xp": 15},            # 15 XP
    {"name": "Going Strong", "xp": 25},                # 25 XP
    {"name": "Rising Coder", "xp": 50},                # 50 XP
    {"name": "Challenge Master", "xp": 100},           # 100 XP
    {"name": "XP Grinder", "xp": 500},                 # 500 XP
    {"name": "Elite Learner", "xp": 1000},             # 1000 XP
    {"name": "Knowledge Titan", "xp": 5000},           # 5000 XP

    # 🏆 Special milestone
    {"name": "Fast Starter", "streak": 1},             # Logged Day 1
    {"name": "Dedication Pro", "xp": 500, "streak": 10},  # Both XP + streak
    {"name": "Ultimate Scholar", "xp": 2000, "streak": 50}, # Hardcore combo
]

def get_iso_now():
    """Returns current UTC time in ISO 8601 format for Appwrite."""
    return datetime.utcnow().isoformat() + "Z"

@progress_bp.route("/update_progress", methods=["POST"])
def update_progress():
    data = request.json
    user_id = data.get("user_id")
    xp_earned = data.get("xp_earned", 0)
    challenge_title = data.get("challenge_title", "")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_doc = db.get_document(
            database_id=DATABASE_ID,
            collection_id=USER_PROGRESS_COLLECTION,
            document_id=user_id
        )
    except Exception:
        user_doc = db.create_document(
            database_id=DATABASE_ID,
            collection_id=USER_PROGRESS_COLLECTION,
            document_id=user_id,
            data={
                "userId": user_id,
                "xp": 0,
                "streak": 0,
                "badges": "",
                "activities": [],
                "updatedAt": get_iso_now()
            },
            permissions=[
                Permission.read(Role.user(user_id)),
                Permission.update(Role.user(user_id))
            ]
        )

    current_xp = user_doc.get("xp", 0)
    streak = user_doc.get("streak", 0)
    last_update_str = user_doc.get("updatedAt")

    today = datetime.utcnow().date()
    if last_update_str:
        last_date = datetime.fromisoformat(last_update_str.replace("Z", "")).date()
        if last_date == today - timedelta(days=1):
            streak += 1
        elif last_date < today - timedelta(days=1):
            streak = 1
    else:
        streak = 1

    new_xp = current_xp + xp_earned

    badges = set(user_doc.get("badges", "").split(",")) if user_doc.get("badges") else set()
    for rule in BADGE_RULES:
        if "xp" in rule and new_xp >= rule["xp"]:
            badges.add(rule["name"])
        if "streak" in rule and streak >= rule["streak"]:
            badges.add(rule["name"])
    badges_str = ",".join(badges)

    activities = user_doc.get("activities", [])
    if isinstance(activities, str):
        try:
            activities = json.loads(activities)
        except:
            activities = []

    new_activity = {
        "message": f"Earned {xp_earned} XP from {challenge_title}. Streak is now {streak} day(s).",
        "badges": list(badges),
        "timestamp": int(time.time())
    }
    activities.append(json.dumps(new_activity))  

    try:
        db.update_document(
            database_id=DATABASE_ID,
            collection_id=USER_PROGRESS_COLLECTION,
            document_id=user_id,
            data={
                "xp": new_xp,
                "streak": streak,
                "badges": badges_str,
                "activities": activities,
                "updatedAt": get_iso_now()
            }
        )
    except Exception as e:
        return jsonify({"error": f"Failed to update document: {str(e)}"}), 500

    return jsonify({
        "xp": new_xp,
        "streak": streak,
        "badges": list(badges),
        "latest_activity": new_activity,
        "activities": [json.loads(a) for a in activities]  
    })


@progress_bp.route("/get_progress", methods=["GET"])
def get_progress():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_doc = db.get_document(
            database_id=DATABASE_ID,
            collection_id=USER_PROGRESS_COLLECTION,
            document_id=user_id
        )
        badges = set(user_doc.get("badges", "").split(",")) if user_doc.get("badges") else set()
        activities = user_doc.get("activities", [])

        if isinstance(activities, str):
            try:
                activities = json.loads(activities)
            except:
                activities = []

        activities_parsed = [json.loads(a) if isinstance(a, str) else a for a in activities]

        activities_parsed = sorted(
            activities_parsed,
            key=lambda x: x.get("timestamp", 0),
            reverse=True
        )[:10]

        return jsonify({
            "xp": user_doc.get("xp", 0),
            "streak": user_doc.get("streak", 0),
            "badges": list(badges),
            "activities": activities_parsed
        })
    except Exception:
        return jsonify({"xp": 0, "streak": 0, "badges": [], "activities": []})