from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

from routes.nft_routes import nft_routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(
    nft_routes,
    url_prefix="/api",
)


@app.route("/")
def home():
    return jsonify({
        "message": "Dashboard NFT API",
        "status": "online",
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
