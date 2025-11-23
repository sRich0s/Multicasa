from pathlib import Path
import os
from flask import Flask, send_from_directory, abort

ROOT = Path(__file__).parent.resolve()
ALLOWED_EXT = {
    "html", "css", "js", "png", "jpg", "jpeg", "webp", "cur", "ico", "svg", "json"
}

app = Flask(__name__, static_folder=None)


@app.route("/", methods=["GET"])
def index():
    
    return send_from_directory(str(ROOT), "HTML/main.html")


@app.route("/<path:filename>", methods=["GET"])
def static_files(filename: str):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXT:
        return abort(404)
    path = (ROOT / filename).resolve()
    
    if not str(path).startswith(str(ROOT)):
        return abort(403)
    if not path.exists():
        return abort(404)
    return send_from_directory(str(ROOT), filename)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)