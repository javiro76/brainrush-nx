import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School,
  Bookmark,
  Assignment,
  Timeline,
  TrendingUp,
  Star,
  FormatListBulleted,
  ArrowForward,
  Notifications
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';
import { useNavigate } from 'react-router-dom';

// Interfaces para los datos simulados (en una implementación real vendrían del backend)
interface CourseProgress {
  id: string;
  title: string;
  subject: string;
  progress: number;
  color: string;
}

interface UpcomingExam {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface RecentScore {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [recentScores, setRecentScores] = useState<RecentScore[]>([]);

  // En una implementación real, aquí haríamos fetch de los datos desde el backend
  useEffect(() => {
    // Datos simulados para mostrar en el dashboard
    setCourseProgress([
      { id: '1', title: 'Matemáticas', subject: 'Álgebra', progress: 65, color: '#2196f3' },
      { id: '2', title: 'Ciencias', subject: 'Física', progress: 40, color: '#4caf50' },
      { id: '3', title: 'Lenguaje', subject: 'Comprensión lectora', progress: 75, color: '#f44336' },
      { id: '4', title: 'Sociales', subject: 'Historia de Colombia', progress: 30, color: '#ff9800' }
    ]);

    setUpcomingExams([
      { id: '1', title: 'Simulacro ICFES Completo', date: '2023-11-15', type: 'Simulacro' },
      { id: '2', title: 'Examen de Matemáticas', date: '2023-11-10', type: 'Práctica' },
      { id: '3', title: 'Quiz de Lectura Crítica', date: '2023-11-05', type: 'Quiz' }
    ]);

    setRecentScores([
      { id: '1', title: 'Pre-test Matemáticas', score: 38, maxScore: 50, date: '2023-10-28' },
      { id: '2', title: 'Quiz Ciencias Sociales', score: 18, maxScore: 20, date: '2023-10-25' },
      { id: '3', title: 'Simulacro Parcial', score: 65, maxScore: 100, date: '2023-10-20' }
    ]);
  }, []);

  // Calcular el puntaje promedio para el gráfico
  const avgScore = recentScores.length
    ? recentScores.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / recentScores.length * 100
    : 0;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Bienvenida al usuario */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Bienvenido, {user?.name || 'Estudiante'}
          </Typography>
          <Tooltip title="Notificaciones">
            <IconButton color="primary">
              <Notifications />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Continúa preparándote para el examen ICFES. ¡Tu próximo simulacro está programado pronto!
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Progreso del curso */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Mi Progreso
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/courses')}
              >
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {courseProgress.map((course) => (
                <Grid item xs={12} sm={6} key={course.id}>
                  <Card variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {course.title}
                        </Typography>
                        <Chip
                          label={course.subject}
                          size="small"
                          sx={{ bgcolor: course.color + '20', color: course.color }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: course.color
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {course.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/courses/${course.id}`)}>
                        Continuar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Bookmark />}
                        sx={{ ml: 'auto' }}
                      >
                        Guardar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Estadísticas */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Timeline color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Desempeño
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Circular progress indicator for average score */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              my: 3
            }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `radial-gradient(closest-side, white 79%, transparent 80% 100%),
                                conic-gradient(#2196f3 ${avgScore}%, #e0e0e0 0)`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h4" component="div">
                    {Math.round(avgScore)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Promedio de Puntajes Recientes
              </Typography>
            </Box>

            <List dense>
              {recentScores.map((score) => (
                <ListItem key={score.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={score.title}
                    secondary={`${score.date} • ${score.score}/${score.maxScore} puntos`}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${Math.round(score.score / score.maxScore * 100)}%`}
                    size="small"
                    color={score.score / score.maxScore >= 0.7 ? "success" : "warning"}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/stats')}
              sx={{ mt: 2 }}
            >
              Ver estadísticas completas
            </Button>
          </Paper>
        </Grid>

        {/* Próximos exámenes */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormatListBulleted color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Próximos exámenes y simulacros
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/exams')}
              >
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {upcomingExams.map((exam) => (
                <Grid item xs={12} sm={6} md={4} key={exam.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {exam.title}
                        </Typography>
                        <Chip
                          label={exam.type}
                          size="small"
                          color={
                            exam.type === 'Simulacro' ? 'primary' :
                              exam.type === 'Práctica' ? 'info' : 'default'
                          }
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha: {new Date(exam.date).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/exams/${exam.id}`)}
                      >
                        {exam.type === 'Simulacro' ? 'Comenzar' : 'Practicar'}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Star />}
                        sx={{ ml: 'auto' }}
                      >
                        Importante
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
