-- CreateEnum
CREATE TYPE "exam_types" AS ENUM ('SIMULACRO', 'PRACTICA', 'QUIZ', 'DIAGNOSTICO', 'SEGUIMIENTO', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "exam_statuses" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "attempt_statuses" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'PAUSED');

-- CreateEnum
CREATE TYPE "difficulty_levels" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "exam_types" NOT NULL,
    "status" "exam_statuses" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "difficulty_levels" NOT NULL DEFAULT 'INTERMEDIO',
    "createdBy" TEXT,
    "areaId" TEXT,
    "timeLimit" INTEGER,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "passingScore" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "showResults" BOOLEAN NOT NULL DEFAULT true,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "questionSnapshot" JSONB,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "attempt_statuses" NOT NULL DEFAULT 'IN_PROGRESS',
    "attempt" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" INET,
    "userAgent" TEXT,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_responses" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "examQuestionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "responseText" TEXT,
    "isCorrect" BOOLEAN,
    "pointsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeSpent" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_statistics" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "completedAttempts" INTEGER NOT NULL DEFAULT 0,
    "abandonedAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "highestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "medianScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passingRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "fastestCompletion" INTEGER NOT NULL DEFAULT 0,
    "slowestCompletion" INTEGER NOT NULL DEFAULT 0,
    "basicQuestions_AvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intermediateQuestions_AvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancedQuestions_AvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_area_statistics" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "totalExamsTaken" INTEGER NOT NULL DEFAULT 0,
    "totalExamsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalExamsPassed" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worstScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstExamDate" TIMESTAMP(3),
    "lastExamDate" TIMESTAMP(3),
    "improvementTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_area_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalExamsTaken" INTEGER NOT NULL DEFAULT 0,
    "totalExamsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalExamsPassed" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "overallAverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestOverallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "weeklyExamGoal" INTEGER NOT NULL DEFAULT 3,
    "currentWeekExams" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_analytics" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "correctResponses" INTEGER NOT NULL DEFAULT 0,
    "incorrectResponses" INTEGER NOT NULL DEFAULT 0,
    "skippedResponses" INTEGER NOT NULL DEFAULT 0,
    "difficultyIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discriminationIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "optionAnalysis" JSONB,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exams_type_idx" ON "exams"("type");

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- CreateIndex
CREATE INDEX "exams_areaId_idx" ON "exams"("areaId");

-- CreateIndex
CREATE INDEX "exams_createdBy_idx" ON "exams"("createdBy");

-- CreateIndex
CREATE INDEX "exams_createdAt_idx" ON "exams"("createdAt");

-- CreateIndex
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("examId");

-- CreateIndex
CREATE INDEX "exam_questions_questionId_idx" ON "exam_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_examId_questionId_key" ON "exam_questions"("examId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_examId_order_key" ON "exam_questions"("examId", "order");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_idx" ON "exam_attempts"("examId");

-- CreateIndex
CREATE INDEX "exam_attempts_studentId_idx" ON "exam_attempts"("studentId");

-- CreateIndex
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts"("status");

-- CreateIndex
CREATE INDEX "exam_attempts_startedAt_idx" ON "exam_attempts"("startedAt");

-- CreateIndex
CREATE INDEX "exam_attempts_percentage_idx" ON "exam_attempts"("percentage");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_examId_studentId_attempt_key" ON "exam_attempts"("examId", "studentId", "attempt");

-- CreateIndex
CREATE INDEX "exam_responses_attemptId_idx" ON "exam_responses"("attemptId");

-- CreateIndex
CREATE INDEX "exam_responses_examQuestionId_idx" ON "exam_responses"("examQuestionId");

-- CreateIndex
CREATE INDEX "exam_responses_isCorrect_idx" ON "exam_responses"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "exam_responses_attemptId_examQuestionId_key" ON "exam_responses"("attemptId", "examQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_statistics_examId_key" ON "exam_statistics"("examId");

-- CreateIndex
CREATE INDEX "exam_statistics_averageScore_idx" ON "exam_statistics"("averageScore");

-- CreateIndex
CREATE INDEX "exam_statistics_passingRate_idx" ON "exam_statistics"("passingRate");

-- CreateIndex
CREATE INDEX "exam_statistics_lastCalculated_idx" ON "exam_statistics"("lastCalculated");

-- CreateIndex
CREATE INDEX "student_area_statistics_studentId_idx" ON "student_area_statistics"("studentId");

-- CreateIndex
CREATE INDEX "student_area_statistics_areaId_idx" ON "student_area_statistics"("areaId");

-- CreateIndex
CREATE INDEX "student_area_statistics_averageScore_idx" ON "student_area_statistics"("averageScore");

-- CreateIndex
CREATE INDEX "student_area_statistics_lastExamDate_idx" ON "student_area_statistics"("lastExamDate");

-- CreateIndex
CREATE UNIQUE INDEX "student_area_statistics_studentId_areaId_key" ON "student_area_statistics"("studentId", "areaId");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_key" ON "student_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_progress_overallAverageScore_idx" ON "student_progress"("overallAverageScore");

-- CreateIndex
CREATE INDEX "student_progress_lastActivityDate_idx" ON "student_progress"("lastActivityDate");

-- CreateIndex
CREATE INDEX "student_progress_currentStreak_idx" ON "student_progress"("currentStreak");

-- CreateIndex
CREATE UNIQUE INDEX "question_analytics_questionId_key" ON "question_analytics"("questionId");

-- CreateIndex
CREATE INDEX "question_analytics_questionId_idx" ON "question_analytics"("questionId");

-- CreateIndex
CREATE INDEX "question_analytics_difficultyIndex_idx" ON "question_analytics"("difficultyIndex");

-- CreateIndex
CREATE INDEX "question_analytics_discriminationIndex_idx" ON "question_analytics"("discriminationIndex");

-- CreateIndex
CREATE INDEX "question_analytics_lastCalculated_idx" ON "question_analytics"("lastCalculated");

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_responses" ADD CONSTRAINT "exam_responses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_responses" ADD CONSTRAINT "exam_responses_examQuestionId_fkey" FOREIGN KEY ("examQuestionId") REFERENCES "exam_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_statistics" ADD CONSTRAINT "exam_statistics_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
