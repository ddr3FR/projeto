#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running seed..."
npx ts-node prisma/seed.ts

echo "Starting application..."
exec npm run start:dev