#!/bin/bash
# ============================================================
# NaughtyHaughty — Push to GitHub + Deploy to Server
#
# ONE COMMAND that does everything:
#   1. Pushes latest code to GitHub (topazdigital/NaughtyH)
#   2. SSHes into the production server and rebuilds + restarts
#
# Usage (from Replit shell):
#   bash scripts/push-to-github.sh
#   bash scripts/push-to-github.sh "your commit message"
#
# Required Replit Secrets:
#   GITHUB_TOKEN     — GitHub personal access token (repo scope, write access to topazdigital/NaughtyH)
#   SSH_ROOT_PASSWORD — Root password for 157.250.205.180
# ============================================================
set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN secret is not set."
  echo "       Create one at https://github.com/settings/tokens/new (check 'repo' scope)"
  exit 1
fi

if [ -z "$SSH_ROOT_PASSWORD" ]; then
  echo "ERROR: SSH_ROOT_PASSWORD secret is not set."
  exit 1
fi

MSG="${1:-"Update naughtyhaughty.com"}"
REMOTE="https://topazdigital:${GITHUB_TOKEN}@github.com/topazdigital/NaughtyH.git"
SSH_HOST="157.250.205.180"
SSH_USER="root"
SSH_PORT="22"
APPDIR="/home/admin/domains/naughtyhaughty.com/public_html"

# ── 1. Commit any uncommitted changes ─────────────────────
echo ""
echo "========================================"
echo "  [1/3] Committing changes..."
echo "========================================"

git add -A
if git diff --cached --quiet; then
  echo "  No changes to commit."
else
  git commit -m "$MSG"
  echo "  ✅ Committed: $MSG"
fi

# ── 2. Push to GitHub ─────────────────────────────────────
echo ""
echo "========================================"
echo "  [2/3] Pushing to GitHub (NaughtyH)..."
echo "========================================"

git push "$REMOTE" main
echo "  ✅ GitHub updated"

# ── 3. SSH into server — pull, build, restart ─────────────
echo ""
echo "========================================"
echo "  [3/3] Deploying to naughtyhaughty.com..."
echo "========================================"

sshpass -p "$SSH_ROOT_PASSWORD" ssh \
  -p "$SSH_PORT" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=30 \
  "${SSH_USER}@${SSH_HOST}" \
  "set -e
   cd $APPDIR
   echo '[server] Pulling latest from GitHub...'
   git pull https://topazdigital:${GITHUB_TOKEN}@github.com/topazdigital/NaughtyH.git main
   echo '[server] Installing dependencies...'
   pnpm install --frozen-lockfile
   echo '[server] Building frontend...'
   pnpm --filter @workspace/naughty-haughty run build
   echo '[server] Building API server...'
   pnpm --filter @workspace/api-server run build
   echo '[server] Restarting PM2...'
   pm2 restart naughtyhaughty-api
   pm2 save
   echo '[server] Done!'"

echo ""
echo "========================================"
echo "  ✅ All done! naughtyhaughty.com is live."
echo "========================================"
echo ""
