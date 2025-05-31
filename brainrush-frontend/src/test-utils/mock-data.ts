/**
 * Datos mock simples para testing del hook useExamsLogic
 *
 * Este archivo contiene solo los datos necesarios para:
 * - Testing básico del hook useExamsLogic
 * - Datos de ejemplo para exámenes
 */

import { Exam, ExamFilters } from '../types/exams';

/**
 * Examen básico para testing
 */
export const mockExam: Exam = {
  id: '1',
  title: 'Examen de Matemáticas',
  description: 'Evaluación básica de matemáticas',
  type: 'Simulacro',
  subject: 'Matemáticas',
  questionsCount: 25,
  timeInMinutes: 60,
  difficulty: 'Intermedio',
  date: '2024-12-01',
  topics: ['Álgebra', 'Geometría'],
  favorite: false,
  completed: false,
};

/**
 * Examen completado para testing
 */
export const mockCompletedExam: Exam = {
  id: '2',
  title: 'Examen de Historia',
  description: 'Evaluación de historia universal',
  type: 'Práctica',
  subject: 'Historia',
  questionsCount: 20,
  timeInMinutes: 45,
  difficulty: 'Fácil',
  date: '2024-11-15',
  topics: ['Historia Universal'],
  favorite: true,
  completed: true,
};

/**
 * Lista de exámenes para testing
 */
export const mockExams: Exam[] = [
  mockExam,
  mockCompletedExam,
  {
    id: '3',
    title: 'Quiz de Ciencias',
    description: 'Quiz rápido de ciencias',
    type: 'Quiz',
    subject: 'Ciencias',
    questionsCount: 10,
    timeInMinutes: 20,
    difficulty: 'Difícil',
    date: '2024-11-20',
    topics: ['Biología'],
    favorite: false,
    completed: false,
  }
];

/**
 * Filtros básicos para testing
 */
export const mockFilters: ExamFilters = {
  type: '',
  difficulty: '',
  completed: '',
  favorite: false
};
