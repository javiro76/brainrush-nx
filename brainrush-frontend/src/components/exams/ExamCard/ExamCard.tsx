import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Assessment,
  AccessTime,
  CalendarToday,
  Star,
  StarBorder,
  CheckCircleOutline
} from '@mui/icons-material';
import { ExamCardProps } from '../../../types/exams';

/**
 * Componente para mostrar la información de un examen en formato de tarjeta
 * @param exam - Datos del examen
 * @param onExamClick - Función para manejar click en la tarjeta
 * @param onToggleFavorite - Función para cambiar estado de favorito
 */
const ExamCard = ({ exam, onExamClick, onToggleFavorite }: ExamCardProps) => {
  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleFavorite(exam.id);
  };

  const handleCardClick = () => {
    onExamClick(exam);
  };

  const getActionButtonText = () => {
    if (exam.completed) return 'Revisar';
    return exam.type === 'Simulacro' ? 'Comenzar' : 'Practicar';
  };

  return (
    <Card
      variant={exam.favorite ? "elevation" : "outlined"}
      elevation={exam.favorite ? 3 : 0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        opacity: exam.completed ? 0.8 : 1
      }}
    >
      {/* Icono de favorito */}
      <IconButton
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={handleFavoriteClick}
      >
        {exam.favorite ? (
          <Star color="primary" />
        ) : (
          <StarBorder />
        )}
      </IconButton>

      {/* Badge para indicar si está completado */}
      {exam.completed && (
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 16,
          bgcolor: 'success.main',
          color: 'white',
          px: 1,
          py: 0.5,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          display: 'flex',
          alignItems: 'center'
        }}>
          <CheckCircleOutline sx={{ mr: 0.5, fontSize: 16 }} />
          <Typography variant="caption" fontWeight="bold">
            Completado
          </Typography>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Título y tipo de examen */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {exam.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={exam.type}
              size="small"
              color={
                exam.type === 'Simulacro' ? 'primary' :
                  exam.type === 'Práctica' ? 'info' : 'default'
              }
            />
            <Chip
              label={exam.subject}
              size="small"
              variant="outlined"
            />
            <Chip
              label={exam.difficulty}
              size="small"
              color={
                exam.difficulty === 'Difícil' ? 'error' :
                  exam.difficulty === 'Intermedio' ? 'warning' : 'success'
              }
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Descripción */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {exam.description}
        </Typography>

        {/* Información adicional */}
        <List dense disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {exam.questionsCount} preguntas
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {exam.timeInMinutes} minutos
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {new Date(exam.date).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          size="small"
          variant="contained"
          onClick={handleCardClick}
          fullWidth
        >
          {getActionButtonText()}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCard;
