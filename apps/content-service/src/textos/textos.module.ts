import { Module } from '@nestjs/common';
import { TextosService } from './textos.service';
import { TextosController } from './textos.controller';

@Module({
    controllers: [TextosController],
    providers: [TextosService],
    exports: [TextosService],
})
export class TextosModule { }
