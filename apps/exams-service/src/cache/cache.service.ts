import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// Interfaces para el cache
interface ActiveExamData {
  examId: string;
  attemptId: string;
  startedAt: Date;
  timeLimit?: number;
  questions: unknown[];
}

interface ExamStatsData {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
}

interface ExamResultsData {
  score: number;
  percentage: number;
  passed: boolean;
  answers: unknown[];
  completedAt: Date;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  /**
   * Obtiene un valor del cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      this.logger.debug(`Cache GET: ${key} - ${value ? 'HIT' : 'MISS'}`);
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Establece un valor en el cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} - TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Elimina un valor del cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Elimina múltiples claves del cache
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Para Redis, necesitamos usar scan para encontrar las claves
      // Esta implementación es básica, en producción considerar usar lua scripts
      this.logger.debug(`Cache DEL PATTERN: ${pattern}`);
      // TODO: Implementar scan de Redis para eliminar por patrón
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }  /**
   * Limpia todo el cache
   */
  async reset(): Promise<void> {    try {
      // Para Cache Manager v5, usamos el método store.reset() si está disponible
      const store = (this.cacheManager as unknown as { store?: { reset?: () => Promise<void>; flushAll?: () => Promise<void> } }).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
      } else if (store && typeof store.flushAll === 'function') {
        await store.flushAll();
      } else {
        this.logger.warn('Cache reset method not available - using manual deletion');
        // Fallback: intentar limpiar las claves que conocemos
        const keys = [
          'exam:*',
          'exam_stats:*',
          'exam_results:*',
          'content_questions:*',
          'user_answers:*',
          'active_exam:*'
        ];
        for (const key of keys) {
          try {
            await this.cacheManager.del(key);
          } catch (error) {
            // Ignorar errores individuales
            this.logger.debug(`Failed to delete cache key ${key}:`, error);
          }
        }
      }
      this.logger.debug('Cache RESET: All keys cleared');
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  /**
   * Métodos específicos para exámenes
   */
  // Cache de examen activo
  async getActiveExam(userId: string): Promise<ActiveExamData | undefined> {
    return this.get(`active_exam:${userId}`);
  }

  async setActiveExam(userId: string, examData: ActiveExamData, ttl = 7200): Promise<void> {
    await this.set(`active_exam:${userId}`, examData, ttl); // 2 horas por defecto
  }

  async clearActiveExam(userId: string): Promise<void> {
    await this.del(`active_exam:${userId}`);
  }
  // Cache de estadísticas de examen
  async getExamStats(examId: string): Promise<ExamStatsData | undefined> {
    return this.get(`exam_stats:${examId}`);
  }

  async setExamStats(examId: string, stats: ExamStatsData, ttl = 300): Promise<void> {
    await this.set(`exam_stats:${examId}`, stats, ttl); // 5 minutos
  }
  // Cache de preguntas de contenido
  async getContentQuestions(contentId: string): Promise<unknown[] | undefined> {
    return this.get(`content_questions:${contentId}`);
  }

  async setContentQuestions(contentId: string, questions: unknown[], ttl = 1800): Promise<void> {
    await this.set(`content_questions:${contentId}`, questions, ttl); // 30 minutos
  }
  // Cache de resultados de examen
  async getExamResults(examId: string, userId: string): Promise<ExamResultsData | undefined> {
    return this.get(`exam_results:${examId}:${userId}`);
  }

  async setExamResults(examId: string, userId: string, results: ExamResultsData, ttl = 3600): Promise<void> {
    await this.set(`exam_results:${examId}:${userId}`, results, ttl); // 1 hora
  }

  // Invalidación de cache por patrones
  async invalidateUserExams(userId: string): Promise<void> {
    await this.delPattern(`active_exam:${userId}`);
    await this.delPattern(`exam_results:*:${userId}`);
  }
  async invalidateExamCache(examId: string): Promise<void> {
    await this.delPattern(`exam_stats:${examId}`);
    await this.delPattern(`exam_results:${examId}:*`);
  }

  async resetUserAnswersCache(examId: string, userId: string): Promise<void> {
    const pattern = `user_answers:${examId}:${userId}`;
    await this.del(pattern);
  }

  async resetExamCache(examId: string): Promise<void> {
    const patterns = [
      `exam:${examId}`,
      `exam_stats:${examId}`,
      `exam_results:${examId}:*`,
      `content_questions:${examId}`,
      `user_answers:${examId}:*`,
      `active_exam:${examId}:*`
    ];

    for (const pattern of patterns) {
      await this.del(pattern);
    }
  }

  async resetAllCache(): Promise<void> {
    try {
      // Para Cache Manager v5, usamos el método store.reset() si está disponible
      const store = (this.cacheManager as unknown as { store?: { reset?: () => Promise<void>; flushAll?: () => Promise<void> } }).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
      } else if (store && typeof store.flushAll === 'function') {
        await store.flushAll();
      } else {
        this.logger.warn('Cache reset method not available - using manual deletion');
      }
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
      throw error;
    }
  }
}
