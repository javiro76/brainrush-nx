import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import {
  Assessment,
  AccessTime,
  CalendarToday,
  Star,
  CheckCircleOutline,
  ArrowBack
} from '@mui/icons-material';
import { ExamDialogProps } from '../../../types/exams';

/**
 * Componente de diálogo modal que muestra información detallada del examen
 * @param exam - Examen seleccionado
 * @param open - Estado de apertura del diálogo
 * @param onClose - Función para cerrar el diálogo
 * @param onStartExam - Función para iniciar el examen
 */
const ExamDialog = ({ exam, open, onClose, onStartExam }: ExamDialogProps) => {
  if (!exam) return null;

  const getStartButtonText = () => {
    return exam.completed ? 'Revisar Resultados' : 'Iniciar Examen';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {exam.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <ArrowBack />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={exam.type}
            color={
              exam.type === 'Simulacro' ? 'primary' :
                exam.type === 'Práctica' ? 'info' : 'default'
            }
            sx={{ mr: 1 }}
          />
          <Chip
            label={exam.subject}
            variant="outlined"
          />
        </Box>

        <DialogContentText gutterBottom>
          {exam.description}
        </DialogContentText>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Información del examen:
          </Typography>
          <Grid container spacing={2}>
            <Grid component="div" size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {exam.questionsCount} preguntas
                </Typography>
              </Box>
            </Grid>
            <Grid component="div" size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {exam.timeInMinutes} minutos
                </Typography>
              </Box>
            </Grid>
            <Grid component="div" size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Disponible desde: {new Date(exam.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid component="div" size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Dificultad: {exam.difficulty}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Temas incluidos:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {exam.topics.map((topic, index) => (
              <Chip key={index} label={topic} size="small" />
            ))}
          </Box>
        </Box>

        {exam.completed && (
          <Box sx={{
            mt: 3,
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircleOutline sx={{ mr: 1, color: 'success.dark' }} />
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              Ya has completado este examen. Puedes volver a realizarlo o revisar tus respuestas anteriores.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onStartExam}
          autoFocus
        >
          {getStartButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamDialog;
