import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Box
} from '@mui/material';
import { ExamFiltersProps } from '../../../types/exams';

/**
 * Componente de diálogo para filtrar exámenes
 * @param filters - Estado actual de los filtros
 * @param open - Estado de apertura del diálogo
 * @param onClose - Función para cerrar el diálogo
 * @param onApplyFilters - Función para aplicar filtros
 * @param onFiltersChange - Función para cambiar filtros
 */
const ExamFilters = ({
  filters,
  open,
  onClose,
  onApplyFilters,
  onFiltersChange
}: ExamFiltersProps) => {

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, difficulty: event.target.value });
  };

  const handleCompletedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, completed: event.target.value });
  };

  const handleFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, favorite: event.target.checked });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Filtrar exámenes</DialogTitle>

      <DialogContent>
        <FormControl component="fieldset" sx={{ mt: 1, width: '100%' }}>
          <FormLabel component="legend">Dificultad</FormLabel>
          <RadioGroup
            value={filters.difficulty}
            onChange={handleDifficultyChange}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormControlLabel value="" control={<Radio />} label="Todas" />
              <FormControlLabel value="Fácil" control={<Radio />} label="Fácil" />
              <FormControlLabel value="Intermedio" control={<Radio />} label="Intermedio" />
              <FormControlLabel value="Difícil" control={<Radio />} label="Difícil" />
            </Box>
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <FormLabel component="legend">Estado</FormLabel>
          <RadioGroup
            value={filters.completed}
            onChange={handleCompletedChange}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormControlLabel value="" control={<Radio />} label="Todos" />
              <FormControlLabel value="completed" control={<Radio />} label="Completados" />
              <FormControlLabel value="pending" control={<Radio />} label="Pendientes" />
            </Box>
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.favorite}
                onChange={handleFavoriteChange}
              />
            }
            label="Solo favoritos"
          />
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onApplyFilters}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamFilters;
