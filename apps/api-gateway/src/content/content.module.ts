import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContentService } from './content.service';
import { AreasController } from './controllers/areas.controller';
import { TextosController } from './controllers/textos.controller';
import { PreguntasController } from './controllers/preguntas.controller';
import { OpcionesController } from './controllers/opciones.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    AuthModule, // Import AuthModule to make AuthService available for JwtAuthGuard
  ],
  controllers: [
    AreasController,
    TextosController,
    PreguntasController,
    OpcionesController,
  ],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule { }
