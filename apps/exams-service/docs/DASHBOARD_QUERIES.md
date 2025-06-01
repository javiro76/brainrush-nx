# Consultas Prisma para Dashboard - Exams Service

## 🎯 Consultas Específicas para DashboardPage.tsx

Basado en el análisis del frontend, estas son las consultas optimizadas para alimentar el dashboard con datos reales.

### 1. Progreso por Área del Estudiante

```typescript
// Equivalente a courseProgress en DashboardPage.tsx
async function getStudentAreaProgress(studentId: string) {
  const areaProgress = await prisma.studentAreaStatistics.findMany({
    where: { studentId },
    select: {
      areaId: true,
      averageScore: true,
      totalExamsTaken: true,
      totalExamsCompleted: true,
      improvementTrend: true,
      lastExamDate: true
    },
    orderBy: { averageScore: 'desc' }
  });

  // Transformar para el frontend
  return areaProgress.map(area => ({
    id: area.areaId,
    title: getAreaName(area.areaId), // Obtener del content-service
    subject: getAreaSubject(area.areaId),
    progress: Math.round(area.averageScore),
    color: getAreaColor(area.areaId),
    totalExams: area.totalExamsTaken,
    lastActivity: area.lastExamDate
  }));
}
```

### 2. Próximos Exámenes Disponibles

```typescript
// Equivalente a upcomingExams en DashboardPage.tsx
async function getUpcomingExams(studentId: string) {
  // Obtener áreas del estudiante para filtrar exámenes relevantes
  const studentAreas = await prisma.studentAreaStatistics.findMany({
    where: { studentId },
    select: { areaId: true }
  });

  const areaIds = studentAreas.map(area => area.areaId);

  const upcomingExams = await prisma.exam.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { areaId: { in: areaIds } },
        { type: 'SIMULACRO' }, // Simulacros disponibles para todos
        { areaId: null } // Exámenes generales
      ]
    },
    include: {
      statistics: {
        select: {
          totalAttempts: true,
          averageScore: true
        }
      },
      // Verificar si el estudiante ya tiene intentos
      attempts: {
        where: { studentId },
        select: {
          id: true,
          status: true,
          attempt: true
        }
      }
    },
    orderBy: [
      { type: 'asc' }, // SIMULACRO primero
      { createdAt: 'desc' }
    ],
    take: 10
  });

  return upcomingExams
    .filter(exam => {
      // Filtrar exámenes que el estudiante puede tomar
      const completedAttempts = exam.attempts.filter(a => a.status === 'COMPLETED').length;
      return completedAttempts < exam.maxAttempts;
    })
    .map(exam => ({
      id: exam.id,
      title: exam.title,
      date: exam.createdAt.toISOString().split('T')[0], // Simplificado
      type: exam.type,
      timeLimit: exam.timeLimit,
      totalQuestions: exam.totalQuestions,
      attemptsLeft: exam.maxAttempts - exam.attempts.length,
      averageScore: exam.statistics?.averageScore || 0
    }));
}
```

### 3. Puntajes Recientes

```typescript
// Equivalente a recentScores en DashboardPage.tsx
async function getRecentScores(studentId: string, limit: number = 5) {
  const recentAttempts = await prisma.examAttempt.findMany({
    where: {
      studentId,
      status: 'COMPLETED'
    },
    include: {
      exam: {
        select: {
          title: true,
          type: true,
          totalQuestions: true
        }
      }
    },
    orderBy: { completedAt: 'desc' },
    take: limit
  });

  return recentAttempts.map(attempt => ({
    id: attempt.id,
    title: attempt.exam.title,
    score: attempt.correctAnswers,
    maxScore: attempt.totalQuestions,
    percentage: Math.round(attempt.percentage),
    date: attempt.completedAt?.toISOString().split('T')[0] || '',
    timeSpent: attempt.timeSpent ? Math.round(attempt.timeSpent / 60) : 0, // En minutos
    examType: attempt.exam.type
  }));
}
```

### 4. Estadísticas Generales del Dashboard

```typescript
// Para el componente de desempeño circular
async function getStudentPerformanceStats(studentId: string) {
  const studentProgress = await prisma.studentProgress.findUnique({
    where: { studentId },
    select: {
      totalExamsCompleted: true,
      totalExamsPassed: true,
      overallAverageScore: true,
      bestOverallScore: true,
      currentStreak: true,
      longestStreak: true,
      weeklyExamGoal: true,
      currentWeekExams: true,
      lastActivityDate: true
    }
  });

  if (!studentProgress) {
    return null;
  }

  return {
    averageScore: Math.round(studentProgress.overallAverageScore),
    totalExams: studentProgress.totalExamsCompleted,
    passRate: studentProgress.totalExamsCompleted > 0 
      ? Math.round((studentProgress.totalExamsPassed / studentProgress.totalExamsCompleted) * 100)
      : 0,
    currentStreak: studentProgress.currentStreak,
    weeklyProgress: {
      completed: studentProgress.currentWeekExams,
      goal: studentProgress.weeklyExamGoal,
      percentage: Math.round((studentProgress.currentWeekExams / studentProgress.weeklyExamGoal) * 100)
    },
    bestScore: Math.round(studentProgress.bestOverallScore),
    lastActivity: studentProgress.lastActivityDate
  };
}
```

## 🔄 Consultas para Actualización en Tiempo Real

### Actualizar Progreso del Estudiante

```typescript
async function updateStudentProgressAfterExam(
  studentId: string, 
  examId: string, 
  attemptId: string
) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { areaId: true, type: true } }
    }
  });

  if (!attempt || attempt.status !== 'COMPLETED') return;

  // Actualizar progreso general
  await prisma.studentProgress.upsert({
    where: { studentId },
    create: {
      studentId,
      totalExamsTaken: 1,
      totalExamsCompleted: 1,
      totalExamsPassed: attempt.passed ? 1 : 0,
      overallAverageScore: attempt.percentage,
      bestOverallScore: attempt.percentage,
      lastActivityDate: new Date(),
      currentStreak: 1
    },
    update: {
      totalExamsCompleted: { increment: 1 },
      totalExamsPassed: attempt.passed ? { increment: 1 } : undefined,
      lastActivityDate: new Date(),
      // Recalcular promedio general
      overallAverageScore: {
        // Se puede hacer con una query más compleja o calcular en el código
      },
      bestOverallScore: attempt.percentage > 0 ? Math.max(attempt.percentage) : undefined
    }
  });

  // Actualizar estadísticas por área
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
        firstExamDate: new Date(),
        lastExamDate: new Date()
      },
      update: {
        totalExamsCompleted: { increment: 1 },
        totalExamsPassed: attempt.passed ? { increment: 1 } : undefined,
        lastScore: attempt.percentage,
        lastExamDate: new Date(),
        bestScore: Math.max(attempt.percentage),
        // Recalcular promedio por área
      }
    });
  }
}
```

### Consulta para Tendencias de Mejora

```typescript
async function calculateImprovementTrend(studentId: string, areaId: string) {
  const recentAttempts = await prisma.examAttempt.findMany({
    where: {
      studentId,
      exam: { areaId },
      status: 'COMPLETED'
    },
    select: {
      percentage: true,
      completedAt: true
    },
    orderBy: { completedAt: 'desc' },
    take: 10 // Últimos 10 intentos
  });

  if (recentAttempts.length < 2) return 0;

  // Calcular tendencia usando regresión lineal simple
  const scores = recentAttempts.reverse().map((attempt, index) => ({
    x: index,
    y: attempt.percentage
  }));

  const n = scores.length;
  const sumX = scores.reduce((sum, point) => sum + point.x, 0);
  const sumY = scores.reduce((sum, point) => sum + point.y, 0);
  const sumXY = scores.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = scores.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return slope; // Positivo = mejorando, negativo = empeorando
}
```

## 📊 Consultas para Analíticas Avanzadas

### Top Preguntas Más Difíciles

```typescript
async function getMostDifficultQuestions(limit: number = 10) {
  return await prisma.questionAnalytics.findMany({
    where: {
      sampleSize: { gte: 10 } // Mínimo 10 respuestas para ser estadísticamente relevante
    },
    select: {
      questionId: true,
      difficultyIndex: true,
      discriminationIndex: true,
      totalResponses: true,
      correctResponses: true,
      averageTimeSpent: true
    },
    orderBy: { difficultyIndex: 'asc' }, // Menor índice = más difícil
    take: limit
  });
}
```

### Exámenes con Mejor Performance

```typescript
async function getTopPerformingExams(limit: number = 5) {
  return await prisma.examStatistics.findMany({
    where: {
      totalAttempts: { gte: 5 } // Mínimo 5 intentos
    },
    include: {
      exam: {
        select: {
          title: true,
          type: true,
          areaId: true
        }
      }
    },
    orderBy: [
      { passingRate: 'desc' },
      { averageScore: 'desc' }
    ],
    take: limit
  });
}
```

### Ranking de Estudiantes por Área

```typescript
async function getAreaLeaderboard(areaId: string, limit: number = 10) {
  return await prisma.studentAreaStatistics.findMany({
    where: {
      areaId,
      totalExamsCompleted: { gte: 3 } // Mínimo 3 exámenes completados
    },
    select: {
      studentId: true,
      averageScore: true,
      totalExamsCompleted: true,
      bestScore: true,
      improvementTrend: true
    },
    orderBy: [
      { averageScore: 'desc' },
      { totalExamsCompleted: 'desc' }
    ],
    take: limit
  });
}
```

## 🚀 Optimizaciones Específicas

### Query para Dashboard Completo (Single Request)

```typescript
async function getDashboardData(studentId: string) {
  const [
    studentProgress,
    areaProgress,
    upcomingExams,
    recentScores
  ] = await Promise.all([
    // Progreso general
    prisma.studentProgress.findUnique({
      where: { studentId }
    }),
    
    // Progreso por área
    getStudentAreaProgress(studentId),
    
    // Próximos exámenes
    getUpcomingExams(studentId),
    
    // Puntajes recientes
    getRecentScores(studentId)
  ]);

  return {
    studentProgress,
    areaProgress,
    upcomingExams,
    recentScores
  };
}
```

### Materialización de Vistas para Performance

```sql
-- Vista materializada para estadísticas frecuentes
CREATE MATERIALIZED VIEW student_dashboard_summary AS
SELECT 
  sp.student_id,
  sp.overall_average_score,
  sp.total_exams_completed,
  sp.current_streak,
  COUNT(sas.id) as areas_studied,
  AVG(sas.average_score) as cross_area_average
FROM student_progress sp
LEFT JOIN student_area_statistics sas ON sp.student_id = sas.student_id
GROUP BY sp.student_id, sp.overall_average_score, sp.total_exams_completed, sp.current_streak;

-- Refrescar cada hora
REFRESH MATERIALIZED VIEW student_dashboard_summary;
```

Estas consultas están optimizadas para proporcionar todos los datos necesarios para el dashboard de manera eficiente, manteniéndose consistentes con la estructura del frontend analizada.
