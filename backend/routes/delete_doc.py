from flask import Blueprint, request, jsonify
from appwrite.exception import AppwriteException
from services.appwrite_client import databases
import os

delete_doc_bp = Blueprint("delete_doc", __name__)

DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
DOCS_COLLECTION_ID = os.getenv("APPWRITE_DOCS_COLLECTION_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@delete_doc_bp.route("/delete-doc", methods=["POST", "OPTIONS"])
def delete_doc():
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
        doc_id = data.get("docId")

        if not user_id or not doc_id:
            return jsonify({"error": "userId and docId are required"}), 400

        # Fetch the document to verify ownership
        try:
            doc = databases.get_document(
                database_id=DATABASE_ID,
                collection_id=DOCS_COLLECTION_ID,
                document_id=doc_id
            )

            if doc.get("createdBy") != user_id:
                return jsonify({"error": "Unauthorized to delete this document"}), 403

            # Delete the document
            databases.delete_document(
                database_id=DATABASE_ID,
                collection_id=DOCS_COLLECTION_ID,
                document_id=doc_id
            )

            return (
                jsonify({"success": True, "message": "Document deleted successfully"}),
                200,
                {"Access-Control-Allow-Origin": FRONTEND_URL},
            )

        except AppwriteException as e:
            return jsonify({"error": f"Failed to delete document: {str(e)}"}), 400

    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            500,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )
