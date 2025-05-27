#!/usr/bin/env node

// Este script se encarga de gestionar la generación de clientes Prisma
// y de ejecutar los servicios en un monorepo con múltiples bases de datos
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Ruta raíz del proyecto
const ROOT_DIR = path.resolve(__dirname);

// Directorios de los servicios
const AUTH_SERVICE_DIR = path.join(ROOT_DIR, 'apps', 'auth-service');
const CONTENT_SERVICE_DIR = path.join(ROOT_DIR, 'apps', 'content-service');

// Archivos schema.prisma
const AUTH_SCHEMA = path.join(AUTH_SERVICE_DIR, 'prisma', 'schema.prisma');
const CONTENT_SCHEMA = path.join(
  CONTENT_SERVICE_DIR,
  'prisma',
  'schema.prisma'
);

console.log('🚀 Iniciando script de configuración de entorno de desarrollo...');

// Función para ejecutar comandos y mostrar salida
function runCommand(command, options = {}) {
  console.log(`Ejecutando: ${command}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return true;
  } catch (error) {
    console.error(`Error ejecutando: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Paso 1: Iniciar infraestructura Docker
console.log('\n📦 Iniciando infraestructura Docker...');
if (!runCommand('npm run dev:infra:up')) {
  console.error(
    '❌ Error iniciando Docker. Verificar el estado de Docker y los puertos.'
  );
  process.exit(1);
}

// Paso 2: Generar cliente Prisma para auth-service
console.log('\n🔑 Generando cliente Prisma para auth-service...');
if (existsSync(AUTH_SCHEMA)) {
  runCommand(`npx prisma generate --schema=${AUTH_SCHEMA}`);
} else {
  console.error(`❌ No se encontró el esquema Prisma en ${AUTH_SCHEMA}`);
}

// Paso 3: Generar cliente Prisma para content-service
console.log('\n📚 Generando cliente Prisma para content-service...');
if (existsSync(CONTENT_SCHEMA)) {
  runCommand(`npx prisma generate --schema=${CONTENT_SCHEMA}`);
} else {
  console.error(`❌ No se encontró el esquema Prisma en ${CONTENT_SCHEMA}`);
}

// Paso 4: Ejecutar migraciones
console.log('\n📊 Ejecutando migraciones de bases de datos...');
runCommand('npm run prisma:migrate:auth');
runCommand('npm run prisma:migrate:dev:content');

// Paso 5: Ejecutar seed para content-service
console.log('\n🌱 Cargando datos iniciales...');
runCommand('npm run prisma:seed:content');

// Paso 6: Iniciar servicios
console.log('\n🚀 Iniciando servicios...');
runCommand(
  'concurrently "npm run dev:auth" "npm run dev:gateway" "npm run dev:content"'
);

console.log('\n✅ Configuración completada.');
