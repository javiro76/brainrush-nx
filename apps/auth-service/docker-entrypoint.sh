#!/bin/sh
set -e

echo "🔐 Starting Auth Service..."

# Función para verificar la conexión a la base de datos
wait_for_db() {
    echo "⏳ Waiting for PostgreSQL database to be ready..."
    echo "🔧 Database Configuration:"
    echo "   Host: ${AUTH_DB_HOST:-auth-db}"
    echo "   Port: ${AUTH_DB_PORT:-5432}"
    echo "   User: ${AUTH_DB_USER:-postgres}"
    echo "   Database: ${AUTH_DB_NAME:-auth_db}"
    echo "🔍 Using DATABASE_URL: $DATABASE_URL"
    
    until pg_isready -h ${AUTH_DB_HOST:-auth-db} -p ${AUTH_DB_PORT:-5432} -U ${AUTH_DB_USER:-postgres}; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 2
    done
    echo "✅ PostgreSQL is ready!"
}

# Función para ejecutar migraciones
run_migrations() {
    echo "🗄️  Running Prisma migrations..."
    npx prisma migrate deploy
    echo "✅ Migrations completed!"
}

# Función para generar cliente Prisma
generate_prisma() {
    echo "⚙️  Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated!"
}

# Función principal
main() {
    wait_for_db
    generate_prisma
    run_migrations

    echo "🚀 Starting Auth Service application..."
    exec "$@"
}

# Ejecutar función principal con todos los argumentos pasados
main "$@"
