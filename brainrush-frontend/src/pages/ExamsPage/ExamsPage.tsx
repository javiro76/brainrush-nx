import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { useExamsLogic } from '../../hooks/exams/useExamsLogic';
import ExamSearch from '../../components/exams/ExamSearch';
import ExamTabs from '../../components/exams/ExamTabs';
import ExamList from '../../components/exams/ExamList';
import ExamDialog from '../../components/exams/ExamDialog';
import ExamFilters from '../../components/exams/ExamFilters';

/**
 * Página principal de exámenes y simulacros
 * Muestra una lista filtrable y buscable de exámenes disponibles
 */
const ExamsPage = () => {
  const navigate = useNavigate();

  const {
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
  } = useExamsLogic();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton
          sx={{ mr: 1 }}
          onClick={() => navigate(-1)}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Exámenes y Simulacros
        </Typography>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <ExamSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onOpenFilters={handleOpenFilterDialog}
      />

      {/* Pestañas para categorías de exámenes */}
      <ExamTabs
        tabs={tabs}
        currentTab={currentTab}
        exams={exams}
        onTabChange={filterByTab}
      />

      {/* Lista de exámenes */}
      <ExamList
        exams={filteredExams}
        onExamClick={handleOpenExamDialog}
        onToggleFavorite={toggleFavorite}
        onClearFilters={clearFilters}
      />

      {/* Diálogo de información del examen */}
      <ExamDialog
        exam={selectedExam}
        open={openDialog}
        onClose={handleCloseDialog}
        onStartExam={startExam}
      />

      {/* Diálogo de filtros */}
      <ExamFilters
        filters={filters}
        open={filterDialog}
        onClose={handleCloseFilterDialog}
        onApplyFilters={handleApplyFilters}
        onFiltersChange={setFilters}
      />
    </Box>
  );
};

export default ExamsPage;
