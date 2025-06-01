import { Controller, Get, Inject } from '@nestjs/common';
import { ExamsService } from '../services/exams.service';

@Controller('exams')
export class ExamsController {
    constructor(
        @Inject(ExamsService)
        private readonly examsService: ExamsService
    ) { }

    @Get()
    async getAllExams() {
        return this.examsService.getAllExams();
    }

    @Get('test-connection')
    async testConnection() {
        return this.examsService.testConnection();
    }
}
