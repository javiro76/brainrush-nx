#!/bin/sh
set -e

echo "🔐 Starting Auth Service..."

# Función para verificar la conexión a la base de datos
wait_for_db() {
    echo "⏳ Waiting for PostgreSQL database to be ready..."
    until pg_isready -h auth-db -p 5432 -U ${POSTGRES_USER:-auth_user} -d ${POSTGRES_DB:-auth_db}; do
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
