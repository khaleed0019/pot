#!/bin/sh
set -e
cd /app

# Named volume often mounts an empty node_modules over the image — reinstall if needed
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing backend dependencies..."
  npm config set fetch-retries 15 2>/dev/null || true
  npm config set fetch-retry-mintimeout 20000 2>/dev/null || true
  npm config set fetch-retry-maxtimeout 180000 2>/dev/null || true
  npm ci
  npx prisma generate
fi

# DB can be “ready” before it accepts connections; retry a few times
n=0
until npx prisma migrate deploy; do
  n=$((n + 1))
  if [ "$n" -ge 10 ]; then
    echo "prisma migrate deploy failed after 10 attempts"
    exit 1
  fi
  echo "Migrate failed, retrying in 3s... ($n/10)"
  sleep 3
done

case "$1" in
  dev)
    exec npm run dev
    ;;
  start)
    exec npm start
    ;;
  *)
    exec "$@"
    ;;
esac
