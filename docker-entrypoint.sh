#!/bin/sh
set -e
until pnpm exec prisma migrate deploy; do
  echo "migrate deploy failed, retrying in 3s..."
  sleep 3
done
exec "$@"
