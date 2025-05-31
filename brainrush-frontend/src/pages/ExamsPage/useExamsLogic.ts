import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, ExamFilters, ExamTab, UseExamsLogicReturn } from '../../types/exams';

/**
 * Custom hook que maneja toda la lógica del estado de la página de exámenes
 * @returns Objeto con estado y funciones para manejar exámenes
 */
export const useExamsLogic = (): UseExamsLogicReturn => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState<ExamFilters>({
    type: '',
    difficulty: '',
    completed: '',
    favorite: false
  });

  // Tabs para organizar los exámenes
  const tabs: ExamTab[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Simulacros', value: 'Simulacro' },
    { label: 'Prácticas', value: 'Práctica' },
    { label: 'Quizzes', value: 'Quiz' },
  ];

  /**
   * Aplica filtros a una lista base de exámenes
   * @param baseExams - Lista de exámenes a filtrar
   */
  const applyFilters = (baseExams: Exam[]) => {
    let result = [...baseExams];

    if (filters.difficulty) {
      result = result.filter(exam => exam.difficulty === filters.difficulty);
    }

    if (filters.completed === 'completed') {
      result = result.filter(exam => exam.completed);
    } else if (filters.completed === 'pending') {
      result = result.filter(exam => !exam.completed);
    }

    if (filters.favorite) {
      result = result.filter(exam => exam.favorite);
    }

    setFilteredExams(result);
  };

  /**
   * Filtra exámenes por categoría (tab)
   * @param tab - Índice del tab seleccionado
   */
  const filterByTab = (tab: number) => {
    setCurrentTab(tab);

    if (tab === 0) {
      // "Todos" tab
      applyFilters(exams);
    } else {
      // Filter by exam type
      const examType = tabs[tab].value as 'Simulacro' | 'Práctica' | 'Quiz';
      applyFilters(exams.filter(exam => exam.type === examType));
    }
  };

  /**
   * Maneja la búsqueda de exámenes
   * @param event - Evento del input de búsqueda
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      filterByTab(currentTab);
    } else {
      const baseExams = currentTab === 0 ? exams : exams.filter(exam => exam.type === tabs[currentTab].value);
      const searched = baseExams.filter(exam =>
        exam.title.toLowerCase().includes(term) ||
        exam.description.toLowerCase().includes(term) ||
        exam.subject.toLowerCase().includes(term) ||
        exam.topics.some(topic => topic.toLowerCase().includes(term))
      );

      applyFilters(searched);
    }
  };

  /**
   * Abre el diálogo de información del examen
   * @param exam - Examen seleccionado
   */
  const handleOpenExamDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  /**
   * Cierra el diálogo de información del examen
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Inicia el examen seleccionado
   */
  const startExam = () => {
    if (selectedExam) {
      navigate(`/exams/${selectedExam.id}/start`);
    }
    setOpenDialog(false);
  };

  /**
   * Abre el diálogo de filtros
   */
  const handleOpenFilterDialog = () => {
    setFilterDialog(true);
  };

  /**
   * Cierra el diálogo de filtros
   */
  const handleCloseFilterDialog = () => {
    setFilterDialog(false);
  };

  /**
   * Aplica los filtros seleccionados
   */
  const handleApplyFilters = () => {
    let baseExams = exams;

    if (currentTab !== 0) {
      baseExams = exams.filter(exam => exam.type === tabs[currentTab].value);
    }

    // Aplicar búsqueda si existe
    if (searchTerm !== '') {
      baseExams = baseExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm) ||
        exam.description.toLowerCase().includes(searchTerm) ||
        exam.subject.toLowerCase().includes(searchTerm) ||
        exam.topics.some(topic => topic.toLowerCase().includes(searchTerm))
      );
    }

    applyFilters(baseExams);
    setFilterDialog(false);
  };

  /**
   * Cambia el estado de favorito de un examen
   * @param examId - ID del examen
   */
  const toggleFavorite = (examId: string) => {
    const updatedExams = exams.map(exam =>
      exam.id === examId ? { ...exam, favorite: !exam.favorite } : exam
    );
    setExams(updatedExams);

    // Actualizar también los filteredExams
    const updatedFilteredExams = filteredExams.map(exam =>
      exam.id === examId ? { ...exam, favorite: !exam.favorite } : exam
    );
    setFilteredExams(updatedFilteredExams);
  };

  /**
   * Limpia todos los filtros y resetea la vista
   */
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      difficulty: '',
      completed: '',
      favorite: false
    });
    setFilteredExams(exams);
    setCurrentTab(0);
  };

  // Cargar datos simulados al montar el componente
  useEffect(() => {
    // Datos simulados para mostrar en la página de exámenes
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'Simulacro ICFES Completo',
        description: 'Simulacro completo tipo ICFES que cubre todas las áreas evaluadas en el examen real.',
        type: 'Simulacro',
        subject: 'General',
        questionsCount: 120,
        timeInMinutes: 180,
        date: '2023-11-15',
        completed: false,
        favorite: true,
        difficulty: 'Difícil',
        topics: ['Matemáticas', 'Lenguaje', 'Ciencias Sociales', 'Ciencias Naturales', 'Inglés']
      },
      {
        id: '2',
        title: 'Examen de Matemáticas',
        description: 'Práctica de matemáticas enfocada en álgebra y cálculo básico.',
        type: 'Práctica',
        subject: 'Matemáticas',
        questionsCount: 40,
        timeInMinutes: 60,
        date: '2023-11-10',
        completed: false,
        favorite: false,
        difficulty: 'Intermedio',
        topics: ['Álgebra', 'Geometría', 'Cálculo']
      },
      {
        id: '3',
        title: 'Quiz de Lectura Crítica',
        description: 'Quiz rápido para evaluar comprensión de lectura y análisis de textos.',
        type: 'Quiz',
        subject: 'Lenguaje',
        questionsCount: 15,
        timeInMinutes: 20,
        date: '2023-11-05',
        completed: true,
        favorite: false,
        difficulty: 'Fácil',
        topics: ['Comprensión lectora', 'Análisis de texto']
      },
      {
        id: '4',
        title: 'Simulacro Parcial - Ciencias',
        description: 'Simulacro enfocado en las áreas de ciencias naturales.',
        type: 'Simulacro',
        subject: 'Ciencias Naturales',
        questionsCount: 60,
        timeInMinutes: 90,
        date: '2023-11-20',
        completed: false,
        favorite: true,
        difficulty: 'Intermedio',
        topics: ['Física', 'Química', 'Biología']
      },
      {
        id: '5',
        title: 'Práctica de Inglés',
        description: 'Examen completo para preparar la sección de inglés del ICFES.',
        type: 'Práctica',
        subject: 'Inglés',
        questionsCount: 30,
        timeInMinutes: 45,
        date: '2023-11-12',
        completed: true,
        favorite: false,
        difficulty: 'Intermedio',
        topics: ['Reading', 'Grammar']
      },
      {
        id: '6',
        title: 'Quiz Rápido - Historia de Colombia',
        description: 'Evaluación rápida sobre eventos importantes de la historia colombiana.',
        type: 'Quiz',
        subject: 'Ciencias Sociales',
        questionsCount: 10,
        timeInMinutes: 15,
        date: '2023-11-08',
        completed: true,
        favorite: true,
        difficulty: 'Fácil',
        topics: ['Historia', 'Geografía']
      }
    ];

    setExams(mockExams);
    setFilteredExams(mockExams);
  }, []);

  return {
    exams,
    filteredExams,
    searchTerm,
    selectedExam,
    openDialog,
    currentTab,
    filterDialog,
    filters,
    tabs,
    handleSearch,
    handleOpenExamDialog,
    handleCloseDialog,
    startExam,
    handleOpenFilterDialog,
    handleCloseFilterDialog,
    handleApplyFilters,
    toggleFavorite,
    filterByTab,
    clearFilters,
    setFilters
  };
};
