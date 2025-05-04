import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { CommonModule } from './common/common.module';

// Ruta absoluta al directorio raíz del proyecto (ajusta esta ruta según sea necesario)
const projectRoot = 'c:\\Users\\Asus\\Documents\\cursos\\brainrush-nx';

// Asegurarnos que el directorio logs existe
const logDir = path.join(projectRoot, 'logs');
// Intentar crear el directorio si no existe
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Directorio de logs creado en: ${logDir}`);
  } catch (error) {
    console.error(`Error al crear directorio de logs: ${error.message}`);
  }
}

// Imprimir información de depuración
console.log('Directorio de trabajo actual:', process.cwd());
console.log('Directorio de logs configurado:', logDir);
console.log('El directorio existe:', fs.existsSync(logDir));

// Rutas absolutas para los archivos de log
const errorLogPath = path.join(logDir, 'error.log');
const combinedLogPath = path.join(logDir, 'combined.log');

@Module({
  imports: [
    // Rate limiting - protección contra abusos
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // tiempo de vida en milisegundos (60 segundos)
      limit: 10, // número máximo de solicitudes en el ttl
    }]),

    // Sistema de logging centralizado
    WinstonModule.forRoot({
      transports: [
        // Console transport - para desarrollo
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ms }) => {
              return `${timestamp} [${context || 'API'}] ${level}: ${message} ${ms}`;
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
    }),

    // Otros módulos
    HttpModule,
    AuthModule,
    CommonModule, // Importamos el CommonModule que contiene nuestro LoggerService
  ],
  providers: [
    AppService,
    // Configurar ThrottlerGuard como guard global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
