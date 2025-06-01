import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ExamsService } from '../services/exams.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, ExamsController],
  providers: [AppService, ExamsService],
})
export class AppModule { }
