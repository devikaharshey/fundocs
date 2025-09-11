import os
from flask import Blueprint, jsonify
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.users import Users

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

db = Databases(client)
users_service = Users(client)

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/api")

DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
USER_PROGRESS_COLLECTION = os.getenv("APPWRITE_USER_PROGRESS_COLLECTION_ID")

@leaderboard_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    try:
        res = db.list_documents(
            database_id=DATABASE_ID,
            collection_id=USER_PROGRESS_COLLECTION
        )
        user_docs = res.get("documents", [])

        leaderboard = []
        for doc in user_docs:
            user_id = doc.get("user_id") or doc.get("$id")
            username = "Unknown"
            avatar_id = None

            try:
                user_info = users_service.get(user_id)
                username = user_info.get("name") or user_info.get("email")
                avatar_id = user_info.get("prefs", {}).get("avatar")
            except:
                pass

            badges = doc.get("badges", [])
            if isinstance(badges, str):
                badges = [b.strip() for b in badges.split(",") if b.strip()]

            leaderboard.append({
                "$id": user_id,
                "name": username,
                "xp": doc.get("xp", 0),
                "streak": doc.get("streak", 0),
                "badges": badges,
                "avatar": avatar_id
            })

        # Sorting for leaderboard
        leaderboard_sorted = sorted(leaderboard, key=lambda x: x["xp"], reverse=True)

        return jsonify({"leaderboard": leaderboard_sorted})

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Error generating leaderboard:", e)
        return jsonify({"error": "Failed to fetch leaderboard"}), 500
