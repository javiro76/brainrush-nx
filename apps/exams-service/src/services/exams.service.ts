import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllExams() {
        return this.findAllExams();
    }

    async testConnection() {
        try {
            // Prueba de conexión básica
            const result = await this.prisma.$queryRaw`SELECT 1 as test`;
            return {
                status: 'success',
                message: 'Conexión exitosa a exams_db',
                result
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error de conexión',
                error: error.message
            };
        }
    }

    async findAllExams() {
        return this.prisma.exam.findMany({
            take: 10,
            include: {
                questions: true,
                statistics: true,
            },
        });
    }

    async createExam(data: any) {
        return this.prisma.exam.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type || 'SIMULACRO',
                status: 'DRAFT',
                // otros campos según el esquema
            },
        });
    }

    async getExamStatistics() {
        return this.prisma.examStatistics.findMany({
            include: {
                exam: true,
            },
        });
    }
}
