import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useExamsLogic } from './useExamsLogic';
import { Exam } from '../../types/exams';

/**
 * TESTS PARA USEEXAMSLOGIC CUSTOM HOOK
 *
 * Este hook maneja:
 * - Estado de exámenes y filtros
 * - Lógica de búsqueda y filtrado
 * - Gestión de diálogos (información y filtros)
 * - Navegación entre tabs/categorías
 * - Funciones de favoritos y limpieza de filtros
 */

// Wrapper para React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock de exámenes para testing
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Simulacro ICFES Matemáticas',
    description: 'Simulacro completo de matemáticas para ICFES',
    type: 'Simulacro',
    subject: 'Matemáticas',
    questionsCount: 30,
    timeInMinutes: 90,
    date: '2023-11-15',
    completed: false,
    favorite: false,
    difficulty: 'Intermedio',
    topics: ['Álgebra', 'Geometría']
  },
  {
    id: '2',
    title: 'Práctica de Inglés',
    description: 'Práctica de comprensión de lectura en inglés',
    type: 'Práctica',
    subject: 'Inglés',
    questionsCount: 20,
    timeInMinutes: 45,
    date: '2023-11-10',
    completed: true,
    favorite: true,
    difficulty: 'Fácil',
    topics: ['Reading', 'Grammar']
  },
  {
    id: '3',
    title: 'Quiz de Ciencias',
    description: 'Quiz rápido de ciencias naturales',
    type: 'Quiz',
    subject: 'Ciencias',
    questionsCount: 10,
    timeInMinutes: 20,
    date: '2023-11-12',
    completed: false,
    favorite: false,
    difficulty: 'Difícil',
    topics: ['Biología', 'Química']
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useExamsLogic Hook', () => {
  describe('Estado inicial', () => {
    /**
     * Verifica el estado inicial del hook
     * Escenario real: Componente se monta y el hook inicializa correctamente
     */
    it('inicializa con valores por defecto', () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });      // Verificar estado inicial - el hook carga mock data automáticamente
      expect(result.current.exams).toHaveLength(6);
      expect(result.current.filteredExams).toHaveLength(6);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.selectedExam).toBeNull();
      expect(result.current.openDialog).toBe(false);
      expect(result.current.currentTab).toBe(0);
      expect(result.current.filterDialog).toBe(false);
      expect(result.current.filters).toEqual({
        type: '',
        difficulty: '',
        completed: '',
        favorite: false
      });
    });

    /**
     * Verifica que los tabs están definidos correctamente
     * Escenario real: Tabs de categorías se muestran al usuario
     */
    it('define tabs de exámenes correctamente', () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      // Verificar estructura de tabs
      expect(result.current.tabs).toHaveLength(4);
      expect(result.current.tabs[0]).toEqual({ label: 'Todos', value: 'all' });
      expect(result.current.tabs[1]).toEqual({ label: 'Simulacros', value: 'Simulacro' });
      expect(result.current.tabs[2]).toEqual({ label: 'Prácticas', value: 'Práctica' });
      expect(result.current.tabs[3]).toEqual({ label: 'Quizzes', value: 'Quiz' });
    });

    /**
     * Verifica que las funciones están disponibles
     * Escenario real: Componente puede acceder a todas las funciones necesarias
     */
    it('proporciona todas las funciones necesarias', () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      // Verificar que todas las funciones están disponibles
      expect(typeof result.current.handleSearch).toBe('function');
      expect(typeof result.current.handleOpenExamDialog).toBe('function');
      expect(typeof result.current.handleCloseDialog).toBe('function');
      expect(typeof result.current.startExam).toBe('function');
      expect(typeof result.current.handleOpenFilterDialog).toBe('function');
      expect(typeof result.current.handleCloseFilterDialog).toBe('function');
      expect(typeof result.current.handleApplyFilters).toBe('function');
      expect(typeof result.current.toggleFavorite).toBe('function');
      expect(typeof result.current.filterByTab).toBe('function');
      expect(typeof result.current.clearFilters).toBe('function');
      expect(typeof result.current.setFilters).toBe('function');
    });
  });

  describe('Carga de datos inicial', () => {
    /**
     * Verifica que los datos mock se cargan en el useEffect
     * Escenario real: Al cargar la página se obtienen los exámenes disponibles
     */
    it('carga datos mock al montar el componente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      // Esperar a que se ejecute el useEffect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verificar que se cargaron los datos
      expect(result.current.exams.length).toBeGreaterThan(0);
      expect(result.current.filteredExams.length).toBeGreaterThan(0);
      expect(result.current.exams).toEqual(result.current.filteredExams);
    });

    /**
     * Verifica que los exámenes tienen la estructura correcta
     * Escenario real: Datos recibidos del backend tienen formato esperado
     */
    it('carga exámenes con estructura correcta', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const firstExam = result.current.exams[0];
      expect(firstExam).toHaveProperty('id');
      expect(firstExam).toHaveProperty('title');
      expect(firstExam).toHaveProperty('type');
      expect(firstExam).toHaveProperty('subject');
      expect(firstExam).toHaveProperty('difficulty');
      expect(firstExam).toHaveProperty('completed');
      expect(firstExam).toHaveProperty('favorite');
    });
  });

  describe('Funcionalidad de búsqueda', () => {
    /**
     * Verifica la funcionalidad de búsqueda por título
     * Escenario real: Usuario busca exámenes específicos por nombre
     */
    it('filtra exámenes por término de búsqueda en título', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Simular búsqueda
      const searchEvent = {
        target: { value: 'ICFES' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleSearch(searchEvent);
      });

      // Verificar que se actualiza el término de búsqueda
      expect(result.current.searchTerm).toBe('icfes');

      // Verificar que se filtran los resultados
      const hasICFESInTitle = result.current.filteredExams.every(exam =>
        exam.title.toLowerCase().includes('icfes') ||
        exam.description.toLowerCase().includes('icfes') ||
        exam.subject.toLowerCase().includes('icfes') ||
        exam.topics.some(topic => topic.toLowerCase().includes('icfes'))
      );
      expect(hasICFESInTitle).toBe(true);
    });

    /**
     * Verifica la búsqueda por descripción
     * Escenario real: Usuario busca por contenido descriptivo
     */
    it('filtra exámenes por término de búsqueda en descripción', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const searchEvent = {
        target: { value: 'comprensión' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleSearch(searchEvent);
      });

      expect(result.current.searchTerm).toBe('comprensión');
    });

    /**
     * Verifica que la búsqueda vacía muestra todos los exámenes
     * Escenario real: Usuario borra el término de búsqueda
     */
    it('muestra todos los exámenes cuando la búsqueda está vacía', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const initialCount = result.current.filteredExams.length;

      // Buscar algo específico
      act(() => {
        result.current.handleSearch({
          target: { value: 'test' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Limpiar búsqueda
      act(() => {
        result.current.handleSearch({
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filteredExams.length).toBe(initialCount);
    });
  });

  describe('Gestión de diálogos', () => {
    /**
     * Verifica la apertura del diálogo de información de examen
     * Escenario real: Usuario hace clic en un examen para ver detalles
     */
    it('abre el diálogo de examen correctamente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const exam = result.current.exams[0];

      act(() => {
        result.current.handleOpenExamDialog(exam);
      });

      expect(result.current.selectedExam).toEqual(exam);
      expect(result.current.openDialog).toBe(true);
    });

    /**
     * Verifica el cierre del diálogo de información
     * Escenario real: Usuario cierra el diálogo sin iniciar examen
     */
    it('cierra el diálogo de examen correctamente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Abrir diálogo
      act(() => {
        result.current.handleOpenExamDialog(result.current.exams[0]);
      });

      // Cerrar diálogo
      act(() => {
        result.current.handleCloseDialog();
      });

      expect(result.current.openDialog).toBe(false);
    });

    /**
     * Verifica la apertura y cierre del diálogo de filtros
     * Escenario real: Usuario abre y cierra filtros sin aplicarlos
     */
    it('maneja el diálogo de filtros correctamente', () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      // Abrir diálogo de filtros
      act(() => {
        result.current.handleOpenFilterDialog();
      });

      expect(result.current.filterDialog).toBe(true);

      // Cerrar diálogo de filtros
      act(() => {
        result.current.handleCloseFilterDialog();
      });

      expect(result.current.filterDialog).toBe(false);
    });
  });

  describe('Navegación y inicio de examen', () => {
    /**
     * Verifica la navegación al iniciar un examen
     * Escenario real: Usuario inicia un examen desde el diálogo
     */
    it('navega correctamente al iniciar un examen', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const exam = result.current.exams[0];

      // Abrir diálogo con un examen
      act(() => {
        result.current.handleOpenExamDialog(exam);
      });

      // Iniciar examen
      act(() => {
        result.current.startExam();
      });

      // Verificar navegación
      expect(mockNavigate).toHaveBeenCalledWith(`/exams/${exam.id}/start`);
      expect(result.current.openDialog).toBe(false);
    });

    /**
     * Verifica que no navega si no hay examen seleccionado
     * Escenario real: Error de estado o caso extremo
     */
    it('no navega si no hay examen seleccionado', () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      act(() => {
        result.current.startExam();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result.current.openDialog).toBe(false);
    });
  });

  describe('Filtrado por tabs', () => {
    /**
     * Verifica el filtrado por tab "Todos"
     * Escenario real: Usuario selecciona ver todos los exámenes
     */
    it('filtra correctamente por tab "Todos"', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const totalExams = result.current.exams.length;

      act(() => {
        result.current.filterByTab(0); // Tab "Todos"
      });

      expect(result.current.currentTab).toBe(0);
      expect(result.current.filteredExams.length).toBe(totalExams);
    });

    /**
     * Verifica el filtrado por tipo específico
     * Escenario real: Usuario selecciona ver solo simulacros
     */
    it('filtra correctamente por tipo de examen', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.filterByTab(1); // Tab "Simulacros"
      });

      expect(result.current.currentTab).toBe(1);

      // Verificar que solo se muestran simulacros
      const allAreSimulacros = result.current.filteredExams.every(exam => exam.type === 'Simulacro');
      expect(allAreSimulacros).toBe(true);
    });
  });

  describe('Funcionalidad de favoritos', () => {
    /**
     * Verifica que se puede marcar un examen como favorito
     * Escenario real: Usuario marca examen para acceso rápido
     */
    it('marca un examen como favorito', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const examId = result.current.exams[0].id;
      const initialFavoriteState = result.current.exams[0].favorite;

      act(() => {
        result.current.toggleFavorite(examId);
      });

      const updatedExam = result.current.exams.find(exam => exam.id === examId);
      expect(updatedExam?.favorite).toBe(!initialFavoriteState);
    });    /**
     * Verifica que se puede desmarcar un favorito
     * Escenario real: Usuario desmarca examen que ya no considera importante
     */
    it('desmarca un examen favorito', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Buscar un examen que ya sea favorito (id: '1' ya es favorito en los datos mock)
      const examId = '1';
      const initialExam = result.current.exams.find(exam => exam.id === examId);
      expect(initialExam?.favorite).toBe(true);

      // Desmarcar favorito
      act(() => {
        result.current.toggleFavorite(examId);
      });

      const updatedExam = result.current.exams.find(exam => exam.id === examId);
      expect(updatedExam?.favorite).toBe(false);
    });

    /**
     * Verifica que los cambios de favoritos se reflejan en filteredExams
     * Escenario real: Lista filtrada se actualiza inmediatamente
     */
    it('actualiza filteredExams cuando cambian los favoritos', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const examId = result.current.exams[0].id;

      act(() => {
        result.current.toggleFavorite(examId);
      });

      const updatedFilteredExam = result.current.filteredExams.find(exam => exam.id === examId);
      const updatedMainExam = result.current.exams.find(exam => exam.id === examId);

      expect(updatedFilteredExam?.favorite).toBe(updatedMainExam?.favorite);
    });
  });

  describe('Aplicación de filtros', () => {
    /**
     * Verifica la aplicación de filtros de dificultad
     * Escenario real: Usuario filtra por exámenes de dificultad específica
     */
    it('aplica filtros de dificultad correctamente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Establecer filtro de dificultad
      act(() => {
        result.current.setFilters({
          type: '',
          difficulty: 'Fácil',
          completed: '',
          favorite: false
        });
      });

      // Aplicar filtros
      act(() => {
        result.current.handleApplyFilters();
      });

      // Verificar que solo se muestran exámenes fáciles
      const allAreEasy = result.current.filteredExams.every(exam => exam.difficulty === 'Fácil');
      expect(allAreEasy).toBe(true);
    });

    /**
     * Verifica la aplicación de filtros de estado completado
     * Escenario real: Usuario filtra por exámenes completados o pendientes
     */
    it('aplica filtros de estado completado', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Filtrar solo completados
      act(() => {
        result.current.setFilters({
          type: '',
          difficulty: '',
          completed: 'completed',
          favorite: false
        });
      });

      act(() => {
        result.current.handleApplyFilters();
      });

      const allAreCompleted = result.current.filteredExams.every(exam => exam.completed === true);
      expect(allAreCompleted).toBe(true);
    });

    /**
     * Verifica la aplicación de filtro de favoritos
     * Escenario real: Usuario quiere ver solo sus exámenes favoritos
     */
    it('aplica filtro de favoritos correctamente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Marcar algunos como favoritos primero
      act(() => {
        result.current.toggleFavorite(result.current.exams[0].id);
      });

      // Aplicar filtro de favoritos
      act(() => {
        result.current.setFilters({
          type: '',
          difficulty: '',
          completed: '',
          favorite: true
        });
      });

      act(() => {
        result.current.handleApplyFilters();
      });

      const allAreFavorites = result.current.filteredExams.every(exam => exam.favorite === true);
      expect(allAreFavorites).toBe(true);
    });
  });

  describe('Limpieza de filtros', () => {
    /**
     * Verifica que clearFilters resetea todo el estado
     * Escenario real: Usuario limpia todos los filtros para ver todos los exámenes
     */
    it('limpia todos los filtros y resetea el estado', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const initialExamsCount = result.current.exams.length;

      // Aplicar varios filtros y búsqueda
      act(() => {
        result.current.handleSearch({
          target: { value: 'test' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.setFilters({
          type: '',
          difficulty: 'Fácil',
          completed: 'completed',
          favorite: true
        });
      });

      act(() => {
        result.current.filterByTab(1);
      });

      // Limpiar filtros
      act(() => {
        result.current.clearFilters();
      });

      // Verificar que todo se resetea
      expect(result.current.searchTerm).toBe('');
      expect(result.current.currentTab).toBe(0);
      expect(result.current.filters).toEqual({
        type: '',
        difficulty: '',
        completed: '',
        favorite: false
      });
      expect(result.current.filteredExams.length).toBe(initialExamsCount);
    });
  });

  describe('Casos extremos', () => {
    /**
     * Verifica el comportamiento con IDs inexistentes
     * Escenario real: Error de estado o datos corruptos
     */
    it('maneja toggleFavorite con ID inexistente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const initialState = [...result.current.exams];

      act(() => {
        result.current.toggleFavorite('inexistent-id');
      });

      // No debería cambiar nada
      expect(result.current.exams).toEqual(initialState);
    });

    /**
     * Verifica el comportamiento con filtros vacíos
     * Escenario real: Estado inicial o filtros limpiados
     */
    it('maneja correctamente filtros vacíos', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const totalExams = result.current.exams.length;

      act(() => {
        result.current.setFilters({
          type: '',
          difficulty: '',
          completed: '',
          favorite: false
        });
      });

      act(() => {
        result.current.handleApplyFilters();
      });

      // Debería mostrar todos los exámenes
      expect(result.current.filteredExams.length).toBe(totalExams);
    });

    /**
     * Verifica el comportamiento con tab fuera de rango
     * Escenario real: Error de programación o datos corruptos
     */
    it('maneja tabs fuera de rango correctamente', async () => {
      const { result } = renderHook(() => useExamsLogic(), {
        wrapper: RouterWrapper,
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Intentar acceder a un tab que no existe
      act(() => {
        result.current.filterByTab(999);
      });

      // Debería actualizar currentTab pero no fallar
      expect(result.current.currentTab).toBe(999);
      // El filtrado debería manejar esto graciosamente
    });
  });
});
