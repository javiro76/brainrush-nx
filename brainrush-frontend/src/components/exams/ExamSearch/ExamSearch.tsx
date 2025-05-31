import {
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import {
  Search,
  FilterList
} from '@mui/icons-material';
import { ExamSearchProps } from '../../../types/exams';

/**
 * Componente de barra de búsqueda con botón de filtros
 * @param searchTerm - Término de búsqueda actual
 * @param onSearchChange - Función para manejar cambios en la búsqueda
 * @param onOpenFilters - Función para abrir el diálogo de filtros
 */
const ExamSearch = ({
  searchTerm,
  onSearchChange,
  onOpenFilters
}: ExamSearchProps) => {

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid component="div" size={{ xs: 12, sm: 6, md: 8 }}>
          <TextField
            fullWidth
            placeholder="Buscar exámenes..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={onSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={onOpenFilters}
          >
            Filtrar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExamSearch;
