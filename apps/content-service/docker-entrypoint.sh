#!/bin/sh
# filepath: apps/content-service/docker-entrypoint.sh

set -e

echo "🚀 Starting Content Service..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h content-db -p 5432 -U content; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Set the correct DATABASE_URL for Prisma
export DATABASE_URL="postgresql://content:content@content-db:5432/content_db"

# Change to the correct directory
cd /app

# SIMPLE: Regenerar TODOS los clientes de Prisma para estar seguro
echo "🔧 Regenerating ALL Prisma clients for safety..."
npx prisma generate --schema=./prisma/schema.prisma

# SIMPLE: Verificar que el cliente existe
echo "🔍 Verificando cliente generado..."
if [ -d "/app/node_modules/.prisma/content-client" ]; then
    echo "✅ Content client encontrado"
else
    echo "❌ Content client NO encontrado - regenerando..."
    npx prisma generate --schema=./prisma/schema.prisma
fi

# SIMPLE: Correr migraciones
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "🎉 Content Service is ready!"

# Execute the main command
exec "$@"
