import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Rating,
  IconButton,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Alert,
  CircularProgress,
  Stack,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  PlayArrow,
  School,
  CheckCircle,
  Lock,
  ExpandMore,
  Schedule,
  MenuBook,
  QuestionAnswer,
  InsertDriveFile,
  Forum,
  ArrowBack,
  Star,
  StarBorder,
  BookmarkBorder,
  Bookmark,
  Info,
  NavigateNext
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';

// Interfaces para los datos del curso
interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'reading';
  completed: boolean;
  locked: boolean;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  progress: number;
}

interface CourseDetails {
  id: string;
  title: string;
  subject: string;
  description: string;
  image: string;
  instructor: {
    name: string;
    avatar?: string;
    bio: string;
  };
  overview: string;
  modules: Module[];
  totalLessons: number;
  completedLessons: number;
  duration: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  topics: string[];
  progress: number;
  rating: number;
  reviews: number;
  featured: boolean;
}

const CourseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  // Pestañas de contenido
  const tabs = [
    { label: 'Contenido', value: 0 },
    { label: 'Información', value: 1 },
    { label: 'Instructor', value: 2 },
    { label: 'Discusiones', value: 3 }
  ];

  // En una implementación real, aquí haríamos fetch de los datos desde el backend
  useEffect(() => {
    // Simulamos una petición a la API
    setLoading(true);
    setTimeout(() => {
      // Datos simulados para el curso
      const mockCourse: CourseDetails = {
        id: courseId || '1',
        title: 'Álgebra Fundamental',
        subject: 'Matemáticas',
        description: 'Domina los conceptos fundamentales del álgebra que aparecen en el examen ICFES.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
        instructor: {
          name: 'Carlos Ramírez',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          bio: 'Licenciado en Matemáticas con más de 10 años de experiencia enseñando preparación para el ICFES. Especialista en álgebra y cálculo.'
        },
        overview: 'Este curso está diseñado para ayudarte a dominar los conceptos algebraicos fundamentales que aparecen en el examen ICFES. Aprenderás desde lo básico hasta técnicas avanzadas de resolución de problemas que te permitirán enfrentar con confianza las preguntas de matemáticas en el examen.',
        modules: [
          {
            id: 'm1',
            title: 'Fundamentos de Álgebra',
            progress: 100,
            lessons: [
              { id: 'l1', title: 'Introducción al Álgebra', duration: '10:15', type: 'video', completed: true, locked: false },
              { id: 'l2', title: 'Operaciones con monomios', duration: '12:30', type: 'video', completed: true, locked: false },
              { id: 'l3', title: 'Ejercicios de práctica', duration: '15:00', type: 'quiz', completed: true, locked: false },
            ]
          },
          {
            id: 'm2',
            title: 'Ecuaciones Lineales',
            progress: 67,
            lessons: [
              { id: 'l4', title: 'Introducción a ecuaciones', duration: '14:20', type: 'video', completed: true, locked: false },
              { id: 'l5', title: 'Métodos de resolución', duration: '18:45', type: 'video', completed: true, locked: false },
              { id: 'l6', title: 'Sistemas de ecuaciones', duration: '22:10', type: 'video', completed: false, locked: false },
              { id: 'l7', title: 'Quiz ecuaciones lineales', duration: '20:00', type: 'quiz', completed: false, locked: false },
            ]
          },
          {
            id: 'm3',
            title: 'Polinomios',
            progress: 20,
            lessons: [
              { id: 'l8', title: 'Operaciones con polinomios', duration: '16:30', type: 'video', completed: true, locked: false },
              { id: 'l9', title: 'Factorización', duration: '20:15', type: 'video', completed: false, locked: false },
              { id: 'l10', title: 'Lectura: Aplicaciones de polinomios', duration: '15:00', type: 'reading', completed: false, locked: false },
              { id: 'l11', title: 'Ejercicios avanzados', duration: '25:00', type: 'quiz', completed: false, locked: false },
            ]
          },
          {
            id: 'm4',
            title: 'Funciones',
            progress: 0,
            lessons: [
              { id: 'l12', title: 'Concepto de función', duration: '15:20', type: 'video', completed: false, locked: false },
              { id: 'l13', title: 'Funciones lineales', duration: '18:40', type: 'video', completed: false, locked: false },
              { id: 'l14', title: 'Funciones cuadráticas', duration: '22:10', type: 'video', completed: false, locked: false },
              { id: 'l15', title: 'Ejercicios de práctica', duration: '30:00', type: 'quiz', completed: false, locked: false },
            ]
          },
          {
            id: 'm5',
            title: 'Logaritmos y Exponenciales',
            progress: 0,
            lessons: [
              { id: 'l16', title: 'Propiedades de logaritmos', duration: '17:30', type: 'video', completed: false, locked: true },
              { id: 'l17', title: 'Ecuaciones exponenciales', duration: '19:15', type: 'video', completed: false, locked: true },
              { id: 'l18', title: 'Aplicaciones prácticas', duration: '15:00', type: 'reading', completed: false, locked: true },
              { id: 'l19', title: 'Examen final', duration: '45:00', type: 'quiz', completed: false, locked: true },
            ]
          }
        ],
        totalLessons: 19,
        completedLessons: 6,
        duration: '6h 30m',
        level: 'Intermedio',
        topics: ['Ecuaciones', 'Polinomios', 'Funciones', 'Logaritmos'],
        progress: 32,
        rating: 4.8,
        reviews: 124,
        featured: false
      };

      setCourse(mockCourse);
      setLoading(false);
    }, 1000);
  }, [courseId]);

  // Manejar cambio de pestaña
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Manejar expansión de módulos
  const handleModuleChange = (moduleId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedModule(isExpanded ? moduleId : false);
  };

  // Manejar clic en lección
  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.locked) {
      // Mostrar mensaje de que la lección está bloqueada
      return;
    }

    setSelectedLesson(lesson);
    // En una implementación real, aquí redirigiremos al usuario a la página de la lección
    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  // Marcar curso como favorito
  const handleToggleFavorite = () => {
    if (course) {
      setCourse({
        ...course,
        featured: !course.featured
      });
    }
  };

  // Determinar si un módulo debe estar expandido por defecto
  useEffect(() => {
    if (course && course.modules.length > 0) {
      // Encontrar el primer módulo no completado
      const firstIncompleteModule = course.modules.find(module => module.progress < 100);
      if (firstIncompleteModule) {
        setExpandedModule(firstIncompleteModule.id);
      } else {
        setExpandedModule(course.modules[0].id);
      }
    }
  }, [course]);

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando curso...
        </Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontró el curso solicitado.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/courses')}
          sx={{ mt: 2 }}
        >
          Volver a cursos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/courses')}
        >
          Cursos
        </Link>
        <Typography color="text.primary">{course.title}</Typography>
      </Breadcrumbs>

      {/* Banner del curso */}
      <Paper
        elevation={2}
        sx={{
          p: 0,
          overflow: 'hidden',
          mb: 3,
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <Grid container>
          <Grid item xs={12} md={8} sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={course.image}
              alt={course.title}
              sx={{
                width: '100%',
                height: { xs: 200, md: 300 },
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={course.subject}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={course.level}
                  size="small"
                  color={
                    course.level === 'Básico' ? 'success' :
                      course.level === 'Intermedio' ? 'primary' : 'error'
                  }
                />
              </Box>

              <Typography variant="h4" component="h1" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
                {course.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 1 }}>
                <Rating value={course.rating} precision={0.5} size="small" readOnly sx={{ color: 'white' }} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {course.rating} ({course.reviews} reseñas)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Avatar
                  src={course.instructor.avatar}
                  sx={{ width: 24, height: 24, mr: 1 }}
                >
                  {course.instructor.name.charAt(0)}
                </Avatar>
                <Typography variant="body2">
                  Instructor: {course.instructor.name}
                </Typography>
                <Box sx={{ mx: 2 }}>|</Box>
                <Schedule fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {course.duration} total
                </Typography>
                <Box sx={{ mx: 2 }}>|</Box>
                <MenuBook fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {course.totalLessons} lecciones
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tu progreso
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={course.progress}
                      size={60}
                      sx={{ color: 'primary.main' }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="text.secondary"
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        {`${Math.round(course.progress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Has completado {course.completedLessons} de {course.totalLessons} lecciones
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ mt: 1, height: 8, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 2, flexGrow: 1 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    fullWidth
                    onClick={() => {
                      // Encontrar la primera lección no completada
                      let foundLesson: Lesson | null = null;

                      for (const module of course.modules) {
                        for (const lesson of module.lessons) {
                          if (!lesson.completed && !lesson.locked) {
                            foundLesson = lesson;
                            break;
                          }
                        }
                        if (foundLesson) break;
                      }

                      if (foundLesson) {
                        handleLessonClick(foundLesson);
                      }
                    }}
                  >
                    Continuar Aprendiendo
                  </Button>

                  <IconButton
                    onClick={handleToggleFavorite}
                    color={course.featured ? 'primary' : 'default'}
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    {course.featured ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Stack>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Consejo</AlertTitle>
                  Completa todas las lecciones para obtener mayor puntuación en el examen ICFES.
                </Alert>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Temas incluidos:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {course.topics.map((topic, index) => (
                      <Chip key={index} label={topic} size="small" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Pestañas de contenido */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              id={`course-tab-${tab.value}`}
              aria-controls={`course-tabpanel-${tab.value}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenido de las pestañas */}
      <Box role="tabpanel" hidden={activeTab !== 0} id="course-tabpanel-0">
        {activeTab === 0 && (
          <Box>
            {course.modules.map((module) => (
              <Accordion
                key={module.id}
                expanded={expandedModule === module.id}
                onChange={handleModuleChange(module.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`module-${module.id}-content`}
                  id={`module-${module.id}-header`}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {module.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge
                          badgeContent={`${module.lessons.filter(l => l.completed).length}/${module.lessons.length}`}
                          color="primary"
                          sx={{ mr: 2 }}
                        />
                        {module.progress === 100 ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : null}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={module.progress}
                      sx={{ mt: 1, height: 4, borderRadius: 5 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List disablePadding>
                    {module.lessons.map((lesson) => (
                      <ListItem
                        key={lesson.id}
                        disablePadding
                        sx={{ mb: 0.5 }}
                      >
                        <ListItemButton
                          onClick={() => handleLessonClick(lesson)}
                          disabled={lesson.locked}
                          sx={{
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider',
                            backgroundColor: lesson.completed ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            {lesson.locked ? (
                              <Lock color="action" />
                            ) : lesson.completed ? (
                              <CheckCircle color="success" />
                            ) : lesson.type === 'video' ? (
                              <PlayArrow color="primary" />
                            ) : lesson.type === 'quiz' ? (
                              <QuestionAnswer color="info" />
                            ) : (
                              <InsertDriveFile color="action" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={lesson.title}
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Schedule fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                {lesson.duration}
                              </Box>
                            }
                          />
                          {lesson.locked && (
                            <Chip
                              label="Bloqueado"
                              size="small"
                              icon={<Lock fontSize="small" />}
                            />
                          )}
                          {lesson.completed && (
                            <Chip
                              label="Completado"
                              size="small"
                              color="success"
                              icon={<CheckCircle fontSize="small" />}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 1} id="course-tabpanel-1">
        {activeTab === 1 && (
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Descripción del curso
            </Typography>
            <Typography variant="body1" paragraph>
              {course.overview}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Lo que aprenderás
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Manipular expresiones algebraicas con confianza" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Resolver ecuaciones lineales y sistemas de ecuaciones" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Factorizar polinomios usando diferentes métodos" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Trabajar con funciones y resolver problemas del mundo real" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Requisitos previos
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText primary="Conocimientos básicos de aritmética (suma, resta, multiplicación y división)" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText primary="Conocimiento elemental de números negativos y fracciones" />
              </ListItem>
            </List>
          </Paper>
        )}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 2} id="course-tabpanel-2">
        {activeTab === 2 && (
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={course.instructor.avatar}
                sx={{ width: 80, height: 80, mr: 3 }}
              >
                {course.instructor.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {course.instructor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instructor de {course.subject}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={4.7} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    4.7 Calificación del instructor
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {course.instructor.bio}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Especialidades
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Álgebra" />
              <Chip label="Cálculo" />
              <Chip label="Geometría" />
              <Chip label="Preparación ICFES" />
            </Box>
          </Paper>
        )}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 3} id="course-tabpanel-3">
        {activeTab === 3 && (
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Forum sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Foro del curso
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Aquí podrás discutir con otros estudiantes y hacer preguntas al instructor.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Forum />}
              >
                Ir al foro
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CourseDetailPage;
