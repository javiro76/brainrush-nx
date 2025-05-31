import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { EmptyStateProps } from '../../../types/exams';

/**
 * Componente que muestra el estado vacío cuando no hay exámenes que mostrar
 * @param onClearFilters - Función para limpiar filtros y mostrar todos los exámenes
 */
const EmptyState = ({ onClearFilters }: EmptyStateProps) => {

  return (
    <Box sx={{ textAlign: 'center', py: 5 }}>
      <HelpOutline sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        No se encontraron exámenes con los filtros aplicados
      </Typography>
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={onClearFilters}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};

export default EmptyState;
