# -*- coding: utf-8 -*-
"""콩 한쪽 - Python 서버 (Node 없이 실행용)"""
import json
import os
import re
import uuid
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
SUBMISSIONS_FILE = os.path.join(DATA_DIR, "submissions.json")
GAME_RESULTS_FILE = os.path.join(DATA_DIR, "game_results.json")

for d in (DATA_DIR, UPLOADS_DIR):
    os.makedirs(d, exist_ok=True)


def read_submissions():
    if not os.path.exists(SUBMISSIONS_FILE):
        return []
    with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_submissions(data):
    with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_game_results():
    if not os.path.exists(GAME_RESULTS_FILE):
        return []
    with open(GAME_RESULTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_game_results(data):
    with open(GAME_RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def parse_multipart(body, boundary):
    if not boundary:
        return None, {}
    boundary = boundary.strip().strip('"')
    parts = body.split(b"--" + boundary.encode())
    fields = {}
    files = {}
    for part in parts:
        if b"\r\n\r\n" not in part or part.strip() == b"":
            continue
        head, rest = part.split(b"\r\n\r\n", 1)
        rest = rest.rstrip(b"\r\n")
        headers = {}
        for line in head.split(b"\r\n"):
            if b": " in line:
                k, v = line.split(b": ", 1)
                headers[k.lower()] = v.decode("utf-8", errors="replace").strip()
        disp = headers.get("content-disposition", "")
        if "filename=" in disp:
            m = re.search(r'name="([^"]+)"', disp)
            fname_m = re.search(r'filename="([^"]*)"', disp)
            if m:
                name = m.group(1)
                filename = fname_m.group(1) if fname_m else "image.jpg"
                files[name] = (filename, rest)
        else:
            m = re.search(r'name="([^"]+)"', disp)
            if m:
                fields[m.group(1)] = rest.decode("utf-8", errors="replace").strip()
    return fields, files


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/submissions":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(read_submissions(), ensure_ascii=False).encode("utf-8"))
            return
        if self.path == "/api/game-results":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(read_game_results(), ensure_ascii=False).encode("utf-8"))
            return
        if self.path.startswith("/uploads/"):
            fname = self.path[len("/uploads/") :].split("?")[0]
            if ".." in fname or not fname:
                self.send_error(404)
                return
            path = os.path.join(UPLOADS_DIR, fname)
            if not os.path.isfile(path):
                self.send_error(404)
                return
            self.send_response(200)
            ext = os.path.splitext(fname)[1].lower()
            ctypes = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp"}
            self.send_header("Content-Type", ctypes.get(ext, "application/octet-stream"))
            self.end_headers()
            with open(path, "rb") as f:
                self.wfile.write(f.read())
            return
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == "/api/game-results":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8", errors="replace")
            try:
                payload = json.loads(body)
            except Exception:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}, ensure_ascii=False).encode("utf-8"))
                return
            record = {
                "id": int(__import__("time").time() * 1000),
                "game1": payload.get("game1"),
                "game2": payload.get("game2"),
                "game3": payload.get("game3"),
                "game4": payload.get("game4"),
                "game5": payload.get("game5"),
                "completedAt": payload.get("completedAt"),
            }
            data = read_game_results()
            data.append(record)
            write_game_results(data)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "id": record["id"]}, ensure_ascii=False).encode("utf-8"))
            return
        if self.path != "/api/submit":
            self.send_error(404)
            return
        ct = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ct:
            self.send_error(400)
            return
        boundary = None
        for part in ct.split(";"):
            part = part.strip()
            if part.startswith("boundary="):
                boundary = part[9:].strip()
                break
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        fields, files = parse_multipart(body, boundary)

        device = fields.get("device", "").strip()
        side = fields.get("side", "").strip()
        name = fields.get("name", "").strip()
        phone = fields.get("phone", "").strip()
        email = fields.get("email", "").strip()
        if not all([device, side, name, phone, email]) or "photo" not in files:
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "필수 항목을 모두 입력해 주세요."}, ensure_ascii=False).encode("utf-8"))
            return

        fname_orig, fbody = files["photo"]
        ext = os.path.splitext(fname_orig)[1] or ".jpg"
        photo_filename = str(uuid.uuid4()) + ext
        photo_path = os.path.join(UPLOADS_DIR, photo_filename)
        with open(photo_path, "wb") as f:
            f.write(fbody)

        submission = {
            "id": int(__import__("time").time() * 1000),
            "device": device,
            "side": side,
            "name": name,
            "phone": phone,
            "email": email,
            "photoFilename": photo_filename,
            "createdAt": __import__("datetime").datetime.now().isoformat(),
        }
        data = read_submissions()
        data.append(submission)
        write_submissions(data)

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True, "id": submission["id"]}, ensure_ascii=False).encode("utf-8"))

    def log_message(self, format, *args):
        print("[%s] %s" % (self.log_date_time_string(), format % args))


if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print("콩 한쪽 서버: http://localhost:%d" % PORT)
    server.serve_forever()
