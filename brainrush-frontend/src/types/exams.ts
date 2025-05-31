/**
 * Tipos relacionados con el sistema de exámenes
 */

export interface Exam {
  id: string;
  title: string;
  description: string;
  type: 'Simulacro' | 'Práctica' | 'Quiz';
  subject: string;
  questionsCount: number;
  timeInMinutes: number;
  date: string;
  completed: boolean;
  favorite: boolean;
  difficulty: 'Fácil' | 'Intermedio' | 'Difícil';
  topics: string[];
}

export interface ExamFilters {
  type: string;
  difficulty: string;
  completed: string;
  favorite: boolean;
}

export interface ExamTab {
  label: string;
  value: string;
}

// Props para componentes
export interface ExamCardProps {
  exam: Exam;
  onExamClick: (exam: Exam) => void;
  onToggleFavorite: (examId: string) => void;
}

export interface ExamDialogProps {
  exam: Exam | null;
  open: boolean;
  onClose: () => void;
  onStartExam: () => void;
}

export interface ExamFiltersProps {
  filters: ExamFilters;
  open: boolean;
  onClose: () => void;
  onApplyFilters: () => void;
  onFiltersChange: (filters: ExamFilters) => void;
}

export interface ExamListProps {
  exams: Exam[];
  onExamClick: (exam: Exam) => void;
  onToggleFavorite: (examId: string) => void;
  onClearFilters: () => void;
}

export interface ExamSearchProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFilters: () => void;
}

export interface ExamTabsProps {
  tabs: ExamTab[];
  currentTab: number;
  exams: Exam[];
  onTabChange: (tab: number) => void;
}

export interface EmptyStateProps {
  onClearFilters: () => void;
}

export interface UseExamsLogicReturn {
  exams: Exam[];
  filteredExams: Exam[];
  searchTerm: string;
  selectedExam: Exam | null;
  openDialog: boolean;
  currentTab: number;
  filterDialog: boolean;
  filters: ExamFilters;
  tabs: ExamTab[];
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenExamDialog: (exam: Exam) => void;
  handleCloseDialog: () => void;
  startExam: () => void;
  handleOpenFilterDialog: () => void;
  handleCloseFilterDialog: () => void;
  handleApplyFilters: () => void;
  toggleFavorite: (examId: string) => void;
  filterByTab: (tab: number) => void;
  clearFilters: () => void;
  setFilters: (filters: ExamFilters) => void;
}
