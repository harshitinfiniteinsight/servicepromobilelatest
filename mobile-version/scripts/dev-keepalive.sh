#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8081}
LOG_FILE=${LOG_FILE:-/tmp/mobile-dev.log}
PID_FILE=${PID_FILE:-/tmp/mobile-dev-keepalive.pid}

# Resolve project root (mobile-version)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

cleanup() {
  # Kill vite bound to port
  lsof -ti:"$PORT" 2>/dev/null | xargs -I {} kill -9 {} 2>/dev/null || true
}

# If another keepalive is running, stop it
if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "${OLD_PID}" ]] && ps -p "$OLD_PID" >/dev/null 2>&1; then
    kill -9 "$OLD_PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

echo $$ > "$PID_FILE"
trap 'cleanup; rm -f "$PID_FILE"' EXIT

# Free the port before we start
cleanup

echo "[keepalive] Starting mobile dev server on port $PORT at $(date)" | tee -a "$LOG_FILE"

# Simple restart loop
while true; do
  # Ensure port free each iteration
  cleanup
  echo "[keepalive] Launching Vite at $(date)" | tee -a "$LOG_FILE"
  (npm run dev -- --port "$PORT" --host) >> "$LOG_FILE" 2>&1 || true
  EXIT_CODE=$?
  echo "[keepalive] Vite exited with code $EXIT_CODE at $(date). Restarting in 1s..." | tee -a "$LOG_FILE"
  sleep 1
done
