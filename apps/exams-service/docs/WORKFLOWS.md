# Flujos de Trabajo Completos - Exams Service

## 🎯 Casos de Uso Implementados

Este documento presenta los flujos de trabajo completos para los principales casos de uso del sistema de exámenes, mostrando cómo interactúan los diferentes modelos del esquema.

## 👨‍🏫 Flujo del Profesor: Crear y Gestionar Exámenes

### 1. Crear un Nuevo Examen

```typescript
async function createExam(teacherId: string, examData: CreateExamDTO) {
  // 1. Crear el examen base
  const exam = await prisma.exam.create({
    data: {
      title: examData.title,
      description: examData.description,
      type: examData.type,
      difficulty: examData.difficulty,
      areaId: examData.areaId,
      timeLimit: examData.timeLimit,
      maxAttempts: examData.maxAttempts,
      passingScore: examData.passingScore,
      showResults: examData.showResults,
      shuffleQuestions: examData.shuffleQuestions,
      shuffleOptions: examData.shuffleOptions,
      createdBy: teacherId,
      status: 'DRAFT'
    }
  });

  // 2. Obtener preguntas del content-service
  const selectedQuestions = await fetchQuestionsFromContentService(
    examData.questionIds
  );

  // 3. Crear preguntas del examen con snapshots
  const examQuestions = await Promise.all(
    examData.questionIds.map(async (questionId, index) => {
      const questionData = selectedQuestions.find(q => q.id === questionId);
      
      return prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: questionId,
          order: index + 1,
          points: questionData.difficulty === 'AVANZADO' ? 2 : 1,
          questionSnapshot: {
            id: questionData.id,
            texto: questionData.texto,
            competenciaId: questionData.competenciaId,
            afirmacionId: questionData.afirmacionId,
            opciones: questionData.opciones,
            opcionCorrecta: questionData.opcionCorrecta,
            explicacion: questionData.explicacion,
            snapshotTimestamp: new Date().toISOString()
          }
        }
      });
    })
  );

  // 4. Actualizar contador de preguntas
  await prisma.exam.update({
    where: { id: exam.id },
    data: { totalQuestions: examQuestions.length }
  });

  // 5. Crear estadísticas base
  await prisma.examStatistics.create({
    data: {
      examId: exam.id,
      totalAttempts: 0,
      totalStudents: 0,
      averageScore: 0
    }
  });

  return { exam, questions: examQuestions };
}
```

### 2. Publicar Examen

```typescript
async function publishExam(examId: string, teacherId: string) {
  // Verificar que el examen pertenece al profesor
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      createdBy: teacherId,
      status: 'DRAFT'
    }
  });

  if (!exam) {
    throw new Error('Examen no encontrado o ya publicado');
  }

  // Validar que tiene preguntas
  const questionCount = await prisma.examQuestion.count({
    where: { examId }
  });

  if (questionCount === 0) {
    throw new Error('El examen debe tener al menos una pregunta');
  }

  // Publicar
  return await prisma.exam.update({
    where: { id: examId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });
}
```

### 3. Ver Estadísticas del Examen

```typescript
async function getExamStatistics(examId: string, teacherId: string) {
  // Verificar permisos
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      createdBy: teacherId
    },
    include: {
      statistics: true
    }
  });

  if (!exam) {
    throw new Error('Examen no encontrado');
  }

  // Obtener estadísticas detalladas por pregunta
  const questionStats = await prisma.examQuestion.findMany({
    where: { examId },
    include: {
      responses: {
        select: {
          isCorrect: true,
          timeSpent: true,
          selectedOptionId: true
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  const detailedStats = questionStats.map(question => {
    const responses = question.responses;
    const correctCount = responses.filter(r => r.isCorrect).length;
    const totalResponses = responses.length;
    const avgTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalResponses;

    return {
      questionId: question.questionId,
      order: question.order,
      totalResponses,
      correctResponses: correctCount,
      incorrectResponses: totalResponses - correctCount,
      successRate: totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0,
      averageTimeSpent: avgTime,
      optionDistribution: calculateOptionDistribution(responses)
    };
  });

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      totalQuestions: exam.totalQuestions
    },
    statistics: exam.statistics,
    questionStatistics: detailedStats
  };
}
```

## 👨‍🎓 Flujo del Estudiante: Realizar Exámenes

### 1. Listar Exámenes Disponibles

```typescript
async function getAvailableExams(studentId: string) {
  // Obtener áreas de interés del estudiante
  const studentAreas = await prisma.studentAreaStatistics.findMany({
    where: { studentId },
    select: { areaId: true }
  });

  const areaIds = studentAreas.map(area => area.areaId);

  // Buscar exámenes disponibles
  const exams = await prisma.exam.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { areaId: { in: areaIds } },
        { type: 'SIMULACRO' },
        { areaId: null }
      ]
    },
    include: {
      attempts: {
        where: { studentId },
        select: { 
          id: true, 
          status: true, 
          attempt: true,
          percentage: true 
        }
      },
      statistics: {
        select: { 
          averageScore: true, 
          totalAttempts: true 
        }
      }
    }
  });

  return exams.map(exam => {
    const studentAttempts = exam.attempts;
    const completedAttempts = studentAttempts.filter(a => a.status === 'COMPLETED').length;
    const inProgressAttempt = studentAttempts.find(a => a.status === 'IN_PROGRESS');
    const canStartNew = completedAttempts < exam.maxAttempts && !inProgressAttempt;
    const bestScore = Math.max(...studentAttempts.map(a => a.percentage), 0);

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      difficulty: exam.difficulty,
      timeLimit: exam.timeLimit,
      totalQuestions: exam.totalQuestions,
      canStart: canStartNew,
      attemptsUsed: completedAttempts,
      maxAttempts: exam.maxAttempts,
      bestScore: bestScore,
      averageScore: exam.statistics?.averageScore || 0,
      inProgressAttemptId: inProgressAttempt?.id
    };
  });
}
```

### 2. Iniciar Examen

```typescript
async function startExam(examId: string, studentId: string) {
  // Verificar disponibilidad
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      attempts: {
        where: { studentId }
      },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          // No incluir respuestas previas para evitar trampas
        }
      }
    }
  });

  if (!exam || exam.status !== 'PUBLISHED') {
    throw new Error('Examen no disponible');
  }

  // Verificar intentos disponibles
  const completedAttempts = exam.attempts.filter(a => a.status === 'COMPLETED').length;
  const inProgressAttempt = exam.attempts.find(a => a.status === 'IN_PROGRESS');

  if (inProgressAttempt) {
    // Continuar intento existente
    return {
      attemptId: inProgressAttempt.id,
      questions: await getExamQuestionsForAttempt(inProgressAttempt.id),
      timeRemaining: calculateTimeRemaining(inProgressAttempt, exam.timeLimit)
    };
  }

  if (completedAttempts >= exam.maxAttempts) {
    throw new Error('Máximo número de intentos alcanzado');
  }

  // Crear nuevo intento
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      attempt: completedAttempts + 1,
      totalQuestions: exam.totalQuestions,
      status: 'IN_PROGRESS'
    }
  });

  // Preparar preguntas (con aleatorización si está habilitada)
  const questions = exam.shuffleQuestions 
    ? shuffleArray([...exam.questions])
    : exam.questions;

  const questionsForStudent = questions.map(q => ({
    id: q.id,
    questionId: q.questionId,
    order: q.order,
    points: q.points,
    questionData: prepareQuestionForStudent(q.questionSnapshot, exam.shuffleOptions)
  }));

  return {
    attemptId: attempt.id,
    questions: questionsForStudent,
    timeLimit: exam.timeLimit,
    showResults: exam.showResults
  };
}
```

### 3. Responder Pregunta

```typescript
async function submitAnswer(
  attemptId: string, 
  examQuestionId: string, 
  selectedOptionId: string,
  timeSpent: number
) {
  // Verificar que el intento está activo
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            where: { id: examQuestionId }
          }
        }
      }
    }
  });

  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    throw new Error('Intento no válido');
  }

  if (attempt.exam.timeLimit && isTimeExpired(attempt, attempt.exam.timeLimit)) {
    await finishExam(attemptId, 'ABANDONED');
    throw new Error('Tiempo agotado');
  }

  const examQuestion = attempt.exam.questions[0];
  if (!examQuestion) {
    throw new Error('Pregunta no encontrada');
  }

  // Evaluar respuesta
  const questionSnapshot = examQuestion.questionSnapshot as any;
  const isCorrect = questionSnapshot.opcionCorrecta === selectedOptionId;
  const pointsEarned = isCorrect ? examQuestion.points : 0;

  // Guardar respuesta
  const response = await prisma.examResponse.upsert({
    where: {
      attemptId_examQuestionId: {
        attemptId,
        examQuestionId
      }
    },
    create: {
      attemptId,
      examQuestionId,
      selectedOptionId,
      responseText: null,
      isCorrect,
      pointsEarned,
      timeSpent
    },
    update: {
      selectedOptionId,
      isCorrect,
      pointsEarned,
      timeSpent,
      answeredAt: new Date()
    }
  });

  // Actualizar contadores del intento
  await updateAttemptCounters(attemptId);

  return {
    responseId: response.id,
    isCorrect,
    pointsEarned,
    correctAnswerExplanation: isCorrect ? null : questionSnapshot.explicacion
  };
}
```

### 4. Finalizar Examen

```typescript
async function finishExam(attemptId: string, finalStatus: 'COMPLETED' | 'ABANDONED' = 'COMPLETED') {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      responses: true
    }
  });

  if (!attempt) {
    throw new Error('Intento no encontrado');
  }

  // Calcular resultados finales
  const totalQuestions = attempt.totalQuestions;
  const answeredQuestions = attempt.responses.length;
  const correctAnswers = attempt.responses.filter(r => r.isCorrect).length;
  const totalScore = attempt.responses.reduce((sum, r) => sum + r.pointsEarned, 0);
  const maxPossibleScore = await calculateMaxPossibleScore(attempt.examId);
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const passed = attempt.exam.passingScore ? percentage >= attempt.exam.passingScore : false;

  // Actualizar intento
  const completedAttempt = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      timeSpent: Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000),
      answeredQuestions,
      correctAnswers,
      incorrectAnswers: answeredQuestions - correctAnswers,
      skippedQuestions: totalQuestions - answeredQuestions,
      totalScore,
      percentage,
      passed
    }
  });

  // Actualizar estadísticas asíncronamente
  updateStudentStatistics(attempt.studentId, attempt.examId, attemptId);
  updateExamStatistics(attempt.examId);
  updateQuestionAnalytics(attempt.responses);

  return {
    attempt: completedAttempt,
    results: {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers: answeredQuestions - correctAnswers,
      skippedQuestions: totalQuestions - answeredQuestions,
      totalScore,
      percentage: Math.round(percentage),
      passed,
      timeSpent: completedAttempt.timeSpent
    }
  };
}
```

## 📊 Flujo de Estadísticas: Actualización y Consulta

### 1. Actualizar Estadísticas del Estudiante

```typescript
async function updateStudentStatistics(studentId: string, examId: string, attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: { areaId: true, type: true }
      }
    }
  });

  if (!attempt || attempt.status !== 'COMPLETED') return;

  // 1. Actualizar progreso general
  const currentDate = new Date();
  const weekStart = getWeekStart(currentDate);

  await prisma.studentProgress.upsert({
    where: { studentId },
    create: {
      studentId,
      totalExamsTaken: 1,
      totalExamsCompleted: 1,
      totalExamsPassed: attempt.passed ? 1 : 0,
      totalTimeSpent: attempt.timeSpent || 0,
      overallAverageScore: attempt.percentage,
      bestOverallScore: attempt.percentage,
      lastActivityDate: currentDate,
      currentStreak: 1,
      longestStreak: 1,
      currentWeekExams: 1
    },
    update: {
      totalExamsCompleted: { increment: 1 },
      totalExamsPassed: attempt.passed ? { increment: 1 } : undefined,
      totalTimeSpent: { increment: attempt.timeSpent || 0 },
      lastActivityDate: currentDate,
      currentWeekExams: { increment: 1 },
      // Recalcular promedio general
      overallAverageScore: await calculateNewAverage(studentId, attempt.percentage),
      bestOverallScore: Math.max(attempt.percentage),
      currentStreak: await calculateCurrentStreak(studentId, currentDate)
    }
  });

  // 2. Actualizar estadísticas por área
  if (attempt.exam.areaId) {
    await prisma.studentAreaStatistics.upsert({
      where: {
        studentId_areaId: {
          studentId,
          areaId: attempt.exam.areaId
        }
      },
      create: {
        studentId,
        areaId: attempt.exam.areaId,
        totalExamsTaken: 1,
        totalExamsCompleted: 1,
        totalExamsPassed: attempt.passed ? 1 : 0,
        averageScore: attempt.percentage,
        bestScore: attempt.percentage,
        worstScore: attempt.percentage,
        lastScore: attempt.percentage,
        firstExamDate: currentDate,
        lastExamDate: currentDate,
        improvementTrend: 0
      },
      update: {
        totalExamsCompleted: { increment: 1 },
        totalExamsPassed: attempt.passed ? { increment: 1 } : undefined,
        lastScore: attempt.percentage,
        lastExamDate: currentDate,
        bestScore: Math.max(attempt.percentage),
        worstScore: Math.min(attempt.percentage),
        averageScore: await calculateAreaAverage(studentId, attempt.exam.areaId),
        improvementTrend: await calculateImprovementTrend(studentId, attempt.exam.areaId)
      }
    });
  }
}
```

### 2. Actualizar Analíticas de Preguntas

```typescript
async function updateQuestionAnalytics(responses: ExamResponse[]) {
  for (const response of responses) {
    const examQuestion = await prisma.examQuestion.findUnique({
      where: { id: response.examQuestionId }
    });

    if (!examQuestion) continue;

    await prisma.questionAnalytics.upsert({
      where: { questionId: examQuestion.questionId },
      create: {
        questionId: examQuestion.questionId,
        totalResponses: 1,
        correctResponses: response.isCorrect ? 1 : 0,
        incorrectResponses: response.isCorrect ? 0 : 1,
        averageTimeSpent: response.timeSpent || 0,
        sampleSize: 1,
        optionAnalysis: response.selectedOptionId ? 
          { [response.selectedOptionId]: 1 } : null
      },
      update: {
        totalResponses: { increment: 1 },
        correctResponses: response.isCorrect ? { increment: 1 } : undefined,
        incorrectResponses: response.isCorrect ? undefined : { increment: 1 },
        sampleSize: { increment: 1 },
        lastCalculated: new Date()
        // Recalcular métricas complejas en background job
      }
    });
  }

  // Programar recálculo de métricas complejas
  await scheduleAnalyticsRecalculation(responses.map(r => r.examQuestionId));
}
```

## 🔄 Jobs de Mantenimiento

### 1. Recálculo Nocturno de Estadísticas

```typescript
async function nightly_recalculate_statistics() {
  console.log('Iniciando recálculo nocturno de estadísticas...');

  // 1. Recalcular estadísticas de exámenes
  const examsToUpdate = await prisma.exam.findMany({
    where: {
      attempts: {
        some: {
          completedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      }
    },
    select: { id: true }
  });

  for (const exam of examsToUpdate) {
    await recalculateExamStatistics(exam.id);
  }

  // 2. Recalcular análisis de preguntas
  await recalculateQuestionAnalytics();

  // 3. Limpiar intentos abandonados antiguos
  await cleanupAbandonedAttempts();

  console.log('Recálculo nocturno completado');
}
```

### 2. Limpieza de Datos

```typescript
async function cleanupAbandonedAttempts() {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 días

  // Marcar como abandonados los intentos en progreso antiguos
  await prisma.examAttempt.updateMany({
    where: {
      status: 'IN_PROGRESS',
      startedAt: { lt: cutoffDate }
    },
    data: {
      status: 'ABANDONED'
    }
  });

  // Eliminar respuestas de intentos muy antiguos (opcional)
  const veryOldDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 año
  
  await prisma.examResponse.deleteMany({
    where: {
      attempt: {
        startedAt: { lt: veryOldDate },
        status: 'ABANDONED'
      }
    }
  });
}
```

Este conjunto de flujos de trabajo muestra cómo el esquema diseñado soporta todas las operaciones necesarias para un sistema de exámenes completo, desde la creación por parte de profesores hasta la realización por estudiantes y el análisis de estadísticas.
