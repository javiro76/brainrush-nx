import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import {
  CreateExamDto,
  UpdateExamDto,
  StartExamDto,
  SubmitExamDto,
  ExamDto,
  ExamStatisticsDto,
} from '../dtos';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { UserRole } from '@brainrush-nx/shared';
import { ExamType, ExamStatus } from '@prisma/exams-client';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(AuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create a new exam',
    description: 'Create a new exam. Only teachers and admins can create exams.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Exam created successfully',
    type: ExamDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body(ValidationPipe) createExamDto: CreateExamDto,
    @GetUser('id') userId: string,
  ): Promise<ExamDto> {
    return this.examsService.create(createExamDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all exams',
    description: 'Retrieve all exams with optional filtering and pagination.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ExamType,
    description: 'Filter by exam type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ExamStatus,
    description: 'Filter by exam status',
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    type: String,
    description: 'Filter by area ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exams retrieved successfully',
  })  async findAll(
    @Query('type') type?: ExamType,
    @Query('status') status?: ExamStatus,
    @Query('areaId') areaId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.examsService.findAll(page, limit, type, status, areaId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get exam by ID',
    description: 'Retrieve a specific exam by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exam retrieved successfully',
    type: ExamDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExamDto> {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update an exam',
    description: 'Update an existing exam. Only the creator or admins can update exams.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exam updated successfully',
    type: ExamDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot update published exam with attempts',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateExamDto: UpdateExamDto,
    @GetUser('id') userId: string,
  ): Promise<ExamDto> {
    return this.examsService.update(id, updateExamDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Delete an exam',
    description: 'Delete an existing exam. Only the creator or admins can delete exams.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Exam deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete exam with attempts',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return this.examsService.remove(id, userId);
  }

  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Start an exam attempt',
    description: 'Start a new attempt for the specified exam. Only students can start exams.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Exam attempt started successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot start exam (not published, max attempts reached, etc.)',
  })
  async startExam(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body(ValidationPipe) startExamDto: StartExamDto,
    @GetUser('id') userId: string,
  ) {
    return this.examsService.startExam(examId, startExamDto, userId);
  }

  @Post('attempts/:attemptId/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Submit exam answers',
    description: 'Submit answers for an exam attempt. Only students can submit their own attempts.',
  })
  @ApiParam({
    name: 'attemptId',
    type: String,
    description: 'Exam attempt ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exam submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam attempt not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Can only submit your own attempts',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Exam attempt is not in progress',
  })
  async submitExam(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body(ValidationPipe) submitExamDto: SubmitExamDto,
    @GetUser('id') userId: string,
  ) {
    return this.examsService.submitExam(attemptId, submitExamDto, userId);
  }

  @Get(':id/statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get exam statistics',
    description: 'Get detailed statistics for an exam. Only teachers and admins can view statistics.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: ExamStatisticsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getStatistics(
    @Param('id', ParseUUIDPipe) examId: string,
  ): Promise<ExamStatisticsDto> {
    return this.examsService.getExamStatistics(examId);
  }

  @Get(':id/attempts')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get exam attempts',
    description: 'Get all attempts for a specific exam. Only teachers and admins can view all attempts.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Exam ID',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: String,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attempts retrieved successfully',
  })
  async getExamAttempts(
    @Param('id', ParseUUIDPipe) examId: string,
    @Query('studentId') studentId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.examsService.getExamAttempts(examId, studentId, page, limit);
  }

  @Get('attempts/:attemptId/results')
  @ApiOperation({
    summary: 'Get exam attempt results',
    description: 'Get detailed results for a specific exam attempt.',
  })
  @ApiParam({
    name: 'attemptId',
    type: String,
    description: 'Exam attempt ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Results retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exam attempt not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Can only view your own results',
  })
  async getAttemptResults(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @GetUser('id') userId: string,
  ) {
    return this.examsService.getAttemptResults(attemptId, userId);
  }

  @Get('students/:studentId/attempts')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get student exam attempts',
    description: 'Get all exam attempts for a specific student. Students can only view their own attempts.',
  })
  @ApiParam({
    name: 'studentId',
    type: String,
    description: 'Student ID',
  })
  @ApiQuery({
    name: 'examId',
    required: false,
    type: String,
    description: 'Filter by exam ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student attempts retrieved successfully',
  })
  async getStudentAttempts(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @GetUser('id') userId: string,
    @Query('examId') examId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    // Estudiantes solo pueden ver sus propios intentos
    if (userId !== studentId) {
      const user = await this.examsService.getUserById(userId);
      if (!['ADMIN', 'TEACHER'].includes(user.role)) {
        throw new ForbiddenException('You can only view your own attempts');
      }
    }

    return this.examsService.getStudentAttempts(studentId, examId, page, limit);
  }
}
