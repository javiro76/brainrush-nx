/**
 * Datos mock para testing de componentes de ExamsPage
 * 
 * Este archivo contiene:
 * - Datos de ejemplo para exámenes
 * - Configuraciones de filtros
 * - Props mock para componentes
 * - Helpers para generar datos de test
 */

import { Exam, ExamFilters, ExamTab } from '../types/exams';

/**
 * Examen mock básico para testing
 * Representa un examen típico con todas las propiedades necesarias
 */
export const mockExam: Exam = {
  id: '1',
  title: 'Examen de Matemáticas Básicas',
  description: 'Evaluación de conceptos fundamentales de matemáticas',
  type: 'Simulacro',
  subject: 'Matemáticas',
  questionsCount: 25,
  timeInMinutes: 60,
  difficulty: 'Intermedio',
  date: '2024-12-01',
  topics: ['Álgebra', 'Geometría', 'Estadística'],
  isFavorite: false,
  completed: false,
  score: null
};

/**
 * Examen completado para testing de estados
 */
export const mockCompletedExam: Exam = {
  ...mockExam,
  id: '2',
  title: 'Examen de Historia Completado',
  subject: 'Historia',
  completed: true,
  score: 85,
  type: 'Práctica'
};

/**
 * Examen favorito para testing de favoritos
 */
export const mockFavoriteExam: Exam = {
  ...mockExam,
  id: '3',
  title: 'Examen Favorito de Ciencias',
  subject: 'Ciencias',
  isFavorite: true,
  type: 'Evaluación'
};

/**
 * Lista de exámenes mock para testing de listas
 */
export const mockExams: Exam[] = [
  mockExam,
  mockCompletedExam,
  mockFavoriteExam,
  {
    ...mockExam,
    id: '4',
    title: 'Examen de Inglés',
    subject: 'Inglés',
    difficulty: 'Básico',
    questionsCount: 20,
    timeInMinutes: 45
  },
  {
    ...mockExam,
    id: '5',
    title: 'Examen Avanzado de Física',
    subject: 'Física',
    difficulty: 'Avanzado',
    questionsCount: 30,
    timeInMinutes: 90
  }
];

/**
 * Filtros mock para testing
 */
export const mockFilters: ExamFilters = {
  subject: '',
  type: '',
  difficulty: '',
  completed: null,
  favorite: false
};

/**
 * Filtros con valores aplicados
 */
export const mockAppliedFilters: ExamFilters = {
  subject: 'Matemáticas',
  type: 'Simulacro',
  difficulty: 'Intermedio',
  completed: false,
  favorite: false
};

/**
 * Tabs mock para testing de pestañas
 */
export const mockTabs: ExamTab[] = [
  { id: 'all', label: 'Todos', count: 5 },
  { id: 'simulacros', label: 'Simulacros', count: 2 },
  { id: 'practica', label: 'Práctica', count: 2 },
  { id: 'evaluacion', label: 'Evaluaciones', count: 1 }
];

/**
 * Helper para generar un examen mock con propiedades personalizadas
 * @param overrides - Propiedades a sobrescribir en el examen base
 * @returns Examen mock personalizado
 */
export const createMockExam = (overrides: Partial<Exam> = {}): Exam => ({
  ...mockExam,
  ...overrides
});

/**
 * Helper para generar múltiples exámenes mock
 * @param count - Cantidad de exámenes a generar
 * @returns Array de exámenes mock
 */
export const createMockExams = (count: number): Exam[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockExam({
      id: `exam-${index + 1}`,
      title: `Examen Mock ${index + 1}`,
    })
  );
};

/**
 * Props mock para componentes - útil para evitar repetición en tests
 */
export const mockComponentProps = {
  onExamClick: jest.fn(),
  onToggleFavorite: jest.fn(),
  onClose: jest.fn(),
  onStartExam: jest.fn(),
  onSearchChange: jest.fn(),
  onOpenFilters: jest.fn(),
  onTabChange: jest.fn(),
  onApplyFilters: jest.fn(),
  onClearFilters: jest.fn(),
  onFiltersChange: jest.fn(),
  onCloseFilterDialog: jest.fn()
};
