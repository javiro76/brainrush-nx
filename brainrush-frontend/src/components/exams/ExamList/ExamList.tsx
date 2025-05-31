import { Grid } from '@mui/material';
import { ExamListProps } from '../../../types/exams';
import ExamCard from '../ExamCard';
import EmptyState from '../EmptyState';

/**
 * Componente que renderiza la lista de exámenes en formato de grid
 * @param exams - Lista de exámenes a mostrar
 * @param onExamClick - Función para manejar click en un examen
 * @param onToggleFavorite - Función para cambiar estado de favorito
 * @param onClearFilters - Función para limpiar filtros
 */
const ExamList = ({
  exams,
  onExamClick,
  onToggleFavorite,
  onClearFilters
}: ExamListProps) => {

  if (exams.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <Grid container spacing={2}>
      {exams.map((exam) => (
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={exam.id}>
          <ExamCard
            exam={exam}
            onExamClick={onExamClick}
            onToggleFavorite={onToggleFavorite}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ExamList;
