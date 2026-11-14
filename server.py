"""Second Spring game server.

Serves the game files from this folder and keeps the online lobbies.
Start it from this folder with:   py server.py
Then open http://localhost:8000 (or share it with Tailscale Funnel: tailscale funnel 8000).

Only standard Python is used, no extra packages.
Lobbies live in memory: they disappear when the server stops.
"""
import json
import os
import re
import secrets
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs

HOST = "127.0.0.1"          # only this PC can reach the server directly; Funnel forwards visitors to it
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

MAX_PLAYERS = 4             # people + bots in one game
MAX_ROOMS = 40              # lobbies open at the same time
MAX_BODY = 1_000_000        # biggest request accepted, in bytes (a game state is about 20-40 KB)
ROOM_TTL = 6 * 3600         # a lobby nobody has touched for 6 hours is removed
CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

rooms = {}
lock = threading.Lock()


def clean_name(n):
    n = re.sub(r"[\x00-\x1f\x7f<>]", "", str(n or "")).strip()[:16]
    return n or "Player"


def tidy():
    now = time.time()
    for code in [c for c, r in rooms.items() if now - r["touched"] > ROOM_TTL]:
        del rooms[code]


def member(room, token):
    for seat, p in enumerate(room["players"]):
        if secrets.compare_digest(p["token"], str(token or "")):
            return seat
    return None


class Handler(SimpleHTTPRequestHandler):
    server_version = "SecondSpring"
    sys_version = ""

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    # ---------- static files ----------
    def send_head(self):
        path = urlsplit(self.path).path
        parts = [p for p in path.split("/") if p]
        # never serve hidden files (.git ...), Python files (this server) or folder listings
        if any(p.startswith(".") for p in parts) or path.endswith(".py"):
            self.send_error(404)
            return None
        if path.endswith("/") and not os.path.exists(os.path.join(self.translate_path(path), "index.html")):
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def log_message(self, fmt, *args):
        # keep the window quiet: only show server errors, not every file, poll or missing card picture
        if len(args) > 1 and str(args[1])[:1] == "5":
            sys.stderr.write("%s  %s\n" % (time.strftime("%H:%M:%S"), fmt % args))

    # ---------- API ----------
    def reply(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlsplit(self.path)
        if u.path.endswith("/api/room"):
            q = parse_qs(u.query)
            code = (q.get("code") or [""])[0].upper()
            with lock:
                room = rooms.get(code)
                if not room:
                    return self.reply(404, {"error": "Lobby not found."})
                if member(room, (q.get("token") or [""])[0]) is None:
                    return self.reply(403, {"error": "Not in this lobby."})
                room["touched"] = time.time()
                try:
                    have = int((q.get("v") or ["0"])[0])
                except ValueError:
                    have = 0
                out = {"status": room["status"], "players": [p["name"] for p in room["players"]],
                       "bots": room["bots"], "v": room["v"]}
                if room["state"] is not None and room["v"] > have:
                    out["state"] = room["state"]
            return self.reply(200, out)
        if "/api/" in u.path:
            return self.reply(404, {"error": "Unknown request."})
        return super().do_GET()

    def do_HEAD(self):
        if "/api/" in self.path:
            return self.send_error(405)
        return super().do_HEAD()

    def do_POST(self):
        path = urlsplit(self.path).path
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = -1
        if n < 0 or n > MAX_BODY:
            return self.reply(413, {"error": "Request too large."})
        try:
            data = json.loads(self.rfile.read(n) or b"{}")
            if not isinstance(data, dict):
                raise ValueError
        except ValueError:
            return self.reply(400, {"error": "Bad request."})
        action = path.rsplit("/", 1)[-1]
        with lock:
            tidy()
            if action == "room":                      # host a new lobby
                if len(rooms) >= MAX_ROOMS:
                    return self.reply(503, {"error": "Too many lobbies open. Try again later."})
                code = "".join(secrets.choice(CODE_CHARS) for _ in range(5))
                while code in rooms:
                    code = "".join(secrets.choice(CODE_CHARS) for _ in range(5))
                try:
                    bots = max(0, min(MAX_PLAYERS - 1, int(data.get("bots", 0))))
                except (TypeError, ValueError):
                    bots = 0
                token = secrets.token_urlsafe(18)
                rooms[code] = {"status": "open", "bots": bots, "v": 0, "state": None, "touched": time.time(),
                               "players": [{"name": clean_name(data.get("name")), "token": token}]}
                return self.reply(200, {"code": code, "token": token, "seat": 0, "bots": bots,
                                        "players": [rooms[code]["players"][0]["name"]]})
            room = rooms.get(str(data.get("code", "")).upper())
            if not room:
                return self.reply(404, {"error": "Lobby not found. Check the code and try again."})
            room["touched"] = time.time()
            if action == "join":                      # join an open lobby
                if room["status"] != "open":
                    return self.reply(409, {"error": "That game has already started."})
                if len(room["players"]) >= MAX_PLAYERS:
                    return self.reply(409, {"error": "That lobby is full."})
                token = secrets.token_urlsafe(18)
                room["players"].append({"name": clean_name(data.get("name")), "token": token})
                return self.reply(200, {"code": str(data["code"]).upper(), "token": token,
                                        "seat": len(room["players"]) - 1, "bots": room["bots"],
                                        "players": [p["name"] for p in room["players"]]})
            seat = member(room, data.get("token"))
            if seat is None:
                return self.reply(403, {"error": "Not in this lobby."})
            state = data.get("state")
            if not isinstance(state, str):
                return self.reply(400, {"error": "Bad request."})
            if action == "start":                     # host starts the game
                if seat != 0:
                    return self.reply(403, {"error": "Only the host can start."})
                if room["status"] != "open":
                    return self.reply(409, {"error": "Already started.", "v": room["v"]})
                room.update(status="playing", state=state, v=1)
                return self.reply(200, {"v": 1})
            if action == "state":                     # a player saves the game after a move
                if room["status"] != "playing":
                    return self.reply(409, {"error": "Not started.", "v": room["v"]})
                if data.get("base") != room["v"]:
                    return self.reply(409, {"error": "Out of date.", "v": room["v"]})
                room["state"] = state
                room["v"] += 1
                return self.reply(200, {"v": room["v"]})
        return self.reply(404, {"error": "Unknown request."})


if __name__ == "__main__":
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    srv.daemon_threads = True
    print(f"Second Spring server running at http://localhost:{PORT}  (press Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
