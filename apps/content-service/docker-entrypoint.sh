#!/bin/sh
# filepath: apps/content-service/docker-entrypoint.sh

set -e

echo "🚀 Starting Content Service..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h ${CONTENT_DB_HOST:-content-db} -p ${CONTENT_DB_PORT:-5432} -U ${CONTENT_DB_USER:-postgres}; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Log database configuration for debugging
echo "🔧 Database Configuration:"
echo "   Host: ${CONTENT_DB_HOST:-content-db}"
echo "   Port: ${CONTENT_DB_PORT:-5432}"
echo "   User: ${CONTENT_DB_USER:-postgres}"
echo "   Database: ${CONTENT_DB_NAME:-content_db}"

# DATABASE_URL is already set from environment variables - don't override it
echo "🔍 Using DATABASE_URL: $DATABASE_URL"

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
