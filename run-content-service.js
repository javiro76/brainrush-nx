#!/usr/bin/env node

// Este script configura el entorno para el servicio de contenido
const { spawn } = require('child_process');
const path = require('path');

// Directorio del servicio
const SERVICE_DIR = path.resolve(__dirname, 'apps', 'content-service');

console.log('🚀 Iniciando configuración para content-service...');

// Configura las variables de entorno para que Prisma use el esquema correcto
const env = {
  ...process.env,
  PRISMA_SCHEMA_NAME: 'content',
};

// Función para ejecutar un comando con las variables de entorno configuradas
const runCommand = (command, args) => {
  console.log(`Ejecutando: ${command} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      env,
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`El comando falló con código: ${code}`));
        return;
      }
      resolve();
    });
  });
};

// Ejecutar el servicio de contenido
runCommand('npx', ['nx', 'serve', 'content-service'])
  .then(() => console.log('✅ Servicio de contenido finalizado.'))
  .catch((err) => console.error('❌ Error:', err.message));
