import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Utilidad para encontrar la raíz del proyecto dinámicamente
 */
export const findProjectRoot = (): string => {
  // Comenzamos con el directorio actual del proceso
  let currentPath = process.cwd();

  // Buscamos hacia arriba hasta encontrar el nx.json
  while (currentPath !== path.parse(currentPath).root) {
    if (fs.existsSync(path.join(currentPath, 'nx.json'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  // Si no encontramos la raíz del proyecto, usamos el directorio actual como fallback
  console.warn('No se pudo determinar la raíz del proyecto. Usando directorio actual.');
  return process.cwd();
};

/**
 * Crea el directorio de logs si no existe
 */
export const ensureLogDirectory = (projectRoot: string): string => {
  const logDir = path.join(projectRoot, 'logs');

  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
      console.log(`Directorio de logs creado en: ${logDir}`);
    } catch (error) {
      console.error(`Error al crear directorio de logs: ${error.message}`);
    }
  }

  return logDir;
};

/**
 * Configuración de Winston para el sistema de logging
 */
export const createWinstonConfig = (serviceName: string = 'App') => {
  const projectRoot = findProjectRoot();
  const logDir = ensureLogDirectory(projectRoot);

  // Rutas absolutas para los archivos de log
  const errorLogPath = path.join(logDir, `${serviceName.toLowerCase()}-error.log`);
  const combinedLogPath = path.join(logDir, `${serviceName.toLowerCase()}-combined.log`);

  console.log(`[${serviceName}] Directorio raíz del proyecto: ${projectRoot}`);
  console.log(`[${serviceName}] Directorio de logs: ${logDir}`);
  console.log(`[${serviceName}] Logs de error: ${errorLogPath}`);
  console.log(`[${serviceName}] Logs combinados: ${combinedLogPath}`);

  return {
    transports: [
      // Console transport - para desarrollo
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ms }) => {
            return `${timestamp} [${context || serviceName}] ${level}: ${message} ${ms}`;
          }),
        ),
      }),

      // File transport - para errores críticos
      new winston.transports.File({
        filename: errorLogPath,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),

      // File transport - para todos los logs
      new winston.transports.File({
        filename: combinedLogPath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  };
};
