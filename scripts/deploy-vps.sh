#!/usr/bin/env bash
# Deploys this checkout to the VPS preview: /opt/apps/chatua (systemd webapp@chatua, port from env).
# Usage (as root, from the repo root): scripts/deploy-vps.sh
# Env (secrets) lives in /opt/deploy/env/chatua.env and is never copied from the repo.
set -euo pipefail

SRC=$(cd "$(dirname "$0")/.." && pwd)
DEST=/opt/projects/chatua/app
ENV_FILE=/opt/deploy/env/chatua.env
LOG=/opt/deploy/logs/build-chatua.log
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1 CI=1

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }

echo "==> Sync source to $DEST"
mkdir -p "$DEST"
rsync -a --delete \
  --exclude node_modules --exclude '.next' --exclude '.next-e2e' --exclude '.env*' \
  --exclude test-results --exclude playwright-report --exclude 'supabase/.temp' --exclude 'supabase/.branches' \
  --exclude '*.tsbuildinfo' --exclude next-env.d.ts \
  "$SRC/" "$DEST/"

cd "$DEST"
set -a; . "$ENV_FILE"; set +a

echo "==> Install dependencies (frozen lockfile)"
corepack pnpm install --frozen-lockfile --prod=false >>"$LOG" 2>&1

echo "==> Apply database migrations and seed (create-only)"
corepack pnpm exec prisma migrate deploy >>"$LOG" 2>&1
corepack pnpm exec prisma db seed >>"$LOG" 2>&1

echo "==> Build"
echo "### $(date -Is) build" >>"$LOG"
corepack pnpm build >>"$LOG" 2>&1 || { echo "Build failed, see $LOG" >&2; tail -30 "$LOG" >&2; exit 1; }

# The app runs as the unprivileged webapp user, which may only write to .next.
chown -R webapp:webapp "$DEST/.next"

echo "==> Restart webapp@chatua"
systemctl restart webapp@chatua
for i in $(seq 1 30); do
  curl -fs -o /dev/null "http://127.0.0.1:${PORT}/robots.txt" && { echo "Up on port $PORT"; exit 0; }
  sleep 1
done
echo "App did not come up; check: journalctl -u webapp@chatua -n 50" >&2
exit 1
