import os
from flask import Flask
from flask_cors import CORS
from routes.fetch_clean_doc import fetch_clean_doc_bp, fetch_user_docs_bp
from routes.delete_account import delete_account_bp
from routes.generated_all import generate_all_bp
from routes.delete_doc import delete_doc_bp
from routes.progress import progress_bp
from routes.submit_challenge import submit_challenge_bp
from routes.report_routes import report_bp
from routes.leaderboard import leaderboard_bp

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://fundocs.appwrite.network")

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": FRONTEND_URL}},  
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register routes
app.register_blueprint(fetch_clean_doc_bp, url_prefix="/api")
app.register_blueprint(fetch_user_docs_bp, url_prefix="/api")
app.register_blueprint(delete_account_bp, url_prefix="/api")
app.register_blueprint(generate_all_bp, url_prefix="/api")
app.register_blueprint(delete_doc_bp, url_prefix="/api")
app.register_blueprint(progress_bp, url_prefix="/api")
app.register_blueprint(submit_challenge_bp, url_prefix="/api")
app.register_blueprint(report_bp, url_prefix="/api")
app.register_blueprint(leaderboard_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
