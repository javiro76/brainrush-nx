import { Module } from '@nestjs/common';
import { OpcionesService } from './opciones.service';
import { OpcionesController } from './opciones.controller';

@Module({
    controllers: [OpcionesController],
    providers: [OpcionesService],
    exports: [OpcionesService],
})
export class OpcionesModule { }
