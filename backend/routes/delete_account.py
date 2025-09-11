from flask import Blueprint, request, jsonify
from appwrite.exception import AppwriteException
from services.appwrite_client import users, databases, storage
from appwrite.query import Query
import os

delete_account_bp = Blueprint("delete_account", __name__)

DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
DOCS_COLLECTION_ID = os.getenv("APPWRITE_DOCS_COLLECTION_ID")
USER_PROGRESS_COLLECTION_ID = os.getenv("APPWRITE_USER_PROGRESS_COLLECTION_ID")
SUBMISSIONS_COLLECTION_ID = os.getenv("APPWRITE_SUMBMIT_CHALLENGE_COLLECTION_ID")
TIPS_COLLECTION_ID = os.getenv("APPWRITE_TIPS_COLLECTION_ID")  
AVATARS_BUCKET_ID = os.getenv("APPWRITE_BUCKET_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@delete_account_bp.route("/delete-account", methods=["POST", "OPTIONS"])
def delete_account():
    if request.method == "OPTIONS":
        return (
            jsonify({"ok": True}),
            200,
            {
                "Access-Control-Allow-Origin": FRONTEND_URL,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

    try:
        data = request.get_json()
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        # 1) Delete avatar file if exists
        try:
            user_info = users.get(user_id)
            avatar_file_id = user_info.get("prefs", {}).get("avatar")
            if avatar_file_id:
                storage.delete_file(AVATARS_BUCKET_ID, avatar_file_id)
        except AppwriteException as e:
            print(f"Failed to delete avatar: {str(e)}")

        # 2) Delete all docs created by user
        try:
            docs = databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=DOCS_COLLECTION_ID,
                queries=[Query.equal("createdBy", user_id)],
            )
            for doc in docs.get("documents", []):
                databases.delete_document(
                    database_id=DATABASE_ID,
                    collection_id=DOCS_COLLECTION_ID,
                    document_id=doc["$id"],
                )
        except AppwriteException as e:
            return jsonify({"error": f"Failed to delete user documents: {str(e)}"}), 400

        # 3) Delete all challenge submissions by the user
        try:
            submissions = databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=SUBMISSIONS_COLLECTION_ID,
                queries=[Query.equal("user_id", user_id)],
            )
            for sub in submissions.get("documents", []):
                databases.delete_document(
                    database_id=DATABASE_ID,
                    collection_id=SUBMISSIONS_COLLECTION_ID,
                    document_id=sub["$id"],
                )
        except AppwriteException as e:
            print(f"Failed to delete user submissions: {str(e)}")

        # 4) Delete user progress
        try:
            databases.delete_document(
                database_id=DATABASE_ID,
                collection_id=USER_PROGRESS_COLLECTION_ID,
                document_id=user_id,
            )
        except AppwriteException as e:
            if "document not found" not in str(e).lower():
                print(f"Failed to delete user progress: {str(e)}")

        # 5) Delete all tips by user
        try:
            tips = databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=TIPS_COLLECTION_ID,
                queries=[Query.equal("user_id", user_id)],
            )
            for tip in tips.get("documents", []):
                databases.delete_document(
                    database_id=DATABASE_ID,
                    collection_id=TIPS_COLLECTION_ID,
                    document_id=tip["$id"],
                )
        except AppwriteException as e:
            print(f"Failed to delete user tips: {str(e)}")

        # 6) Finally, delete the user
        users.delete(user_id)

        return (
            jsonify(
                {
                    "success": True,
                    "message": "User, avatar, progress, submissions, tips, and all related documents deleted",
                }
            ),
            200,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )

    except AppwriteException as e:
        return (
            jsonify({"error": str(e)}),
            400,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )
    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            500,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )
