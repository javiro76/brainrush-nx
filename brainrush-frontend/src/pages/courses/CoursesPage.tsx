import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  LinearProgress,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Stack,
  Rating
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  Lock,
  LockOpen,
  School,
  Person,
  AccessTime,
  ArrowForward,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';

// Interface para los datos de cursos
interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  image: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  progress: number;
  rating: number;
  totalLessons: number;
  completedLessons: number;
  duration: string; // ej. "12h 30m"
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  enrolled: boolean;
  locked: boolean;
  featured: boolean;
  topics: string[];
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState({
    subject: '',
    level: '',
    enrolled: false
  });

  // Tabs para categorizar los cursos
  const tabs = [
    { label: 'Todos', value: 'all' },
    { label: 'Matemáticas', value: 'math' },
    { label: 'Lenguaje', value: 'language' },
    { label: 'Ciencias', value: 'science' },
    { label: 'Sociales', value: 'social' }
  ];

  // En una implementación real, aquí haríamos fetch de los datos desde el backend
  useEffect(() => {
    // Datos simulados para mostrar en la página de cursos
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Álgebra Fundamental',
        subject: 'Matemáticas',
        description: 'Domina los conceptos fundamentales del álgebra que aparecen en el examen ICFES.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
        instructor: {
          name: 'Carlos Ramírez',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        progress: 75,
        rating: 4.8,
        totalLessons: 24,
        completedLessons: 18,
        duration: '18h 45m',
        level: 'Intermedio',
        enrolled: true,
        locked: false,
        featured: true,
        topics: ['Ecuaciones', 'Polinomios', 'Funciones', 'Logaritmos']
      },
      {
        id: '2',
        title: 'Comprensión de Lectura Crítica',
        subject: 'Lenguaje',
        description: 'Aprende técnicas efectivas para analizar textos y responder preguntas de comprensión lectora.',
        image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
        instructor: {
          name: 'Ana Martínez',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        progress: 40,
        rating: 4.5,
        totalLessons: 18,
        completedLessons: 7,
        duration: '14h 20m',
        level: 'Básico',
        enrolled: true,
        locked: false,
        featured: false,
        topics: ['Análisis de texto', 'Argumentación', 'Inferencia', 'Sintaxis']
      },
      {
        id: '3',
        title: 'Física Mecánica',
        subject: 'Ciencias',
        description: 'Conceptos fundamentales de física clásica que son evaluados en el ICFES.',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
        instructor: {
          name: 'Juan Pérez',
          avatar: 'https://randomuser.me/api/portraits/men/62.jpg'
        },
        progress: 20,
        rating: 4.7,
        totalLessons: 30,
        completedLessons: 6,
        duration: '22h 15m',
        level: 'Avanzado',
        enrolled: true,
        locked: false,
        featured: true,
        topics: ['Cinemática', 'Dinámica', 'Trabajo y Energía', 'Fluidos']
      },
      {
        id: '4',
        title: 'Historia de Colombia',
        subject: 'Sociales',
        description: 'Recorrido cronológico por los eventos más importantes de la historia colombiana.',
        image: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559',
        instructor: {
          name: 'Laura González',
          avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
        },
        progress: 0,
        rating: 4.6,
        totalLessons: 20,
        completedLessons: 0,
        duration: '16h 40m',
        level: 'Básico',
        enrolled: false,
        locked: false,
        featured: false,
        topics: ['Época Colonial', 'Independencia', 'República', 'Conflicto Armado']
      },
      {
        id: '5',
        title: 'Biología Celular',
        subject: 'Ciencias',
        description: 'Conceptos esenciales sobre la célula, su estructura y funciones.',
        image: 'https://images.unsplash.com/photo-1626301688449-1fa324d15fd6',
        instructor: {
          name: 'María Rodríguez',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        },
        progress: 0,
        rating: 4.9,
        totalLessons: 22,
        completedLessons: 0,
        duration: '17h 30m',
        level: 'Intermedio',
        enrolled: false,
        locked: true,
        featured: false,
        topics: ['Célula', 'Organelas', 'Reproducción celular', 'Genética']
      },
      {
        id: '6',
        title: 'Estadística Aplicada',
        subject: 'Matemáticas',
        description: 'Conceptos y aplicaciones de estadística para resolver problemas en el ICFES.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
        instructor: {
          name: 'Daniel Torres',
          avatar: 'https://randomuser.me/api/portraits/men/81.jpg'
        },
        progress: 35,
        rating: 4.4,
        totalLessons: 16,
        completedLessons: 6,
        duration: '13h 15m',
        level: 'Avanzado',
        enrolled: true,
        locked: false,
        featured: false,
        topics: ['Probabilidad', 'Estadística descriptiva', 'Distribuciones', 'Inferencia']
      },
      {
        id: '7',
        title: 'Literatura Colombiana',
        subject: 'Lenguaje',
        description: 'Estudio de los principales autores y obras de la literatura colombiana.',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
        instructor: {
          name: 'Fernando Gómez',
          avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
        },
        progress: 0,
        rating: 4.3,
        totalLessons: 15,
        completedLessons: 0,
        duration: '12h 45m',
        level: 'Básico',
        enrolled: false,
        locked: true,
        featured: false,
        topics: ['Realismo mágico', 'Gabriel García Márquez', 'Poesía colombiana', 'Narrativa contemporánea']
      },
      {
        id: '8',
        title: 'Química Orgánica',
        subject: 'Ciencias',
        description: 'Fundamentos de la química del carbono y sus aplicaciones.',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6',
        instructor: {
          name: 'Alejandra Vargas',
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
        },
        progress: 10,
        rating: 4.6,
        totalLessons: 25,
        completedLessons: 2,
        duration: '20h 30m',
        level: 'Avanzado',
        enrolled: true,
        locked: false,
        featured: true,
        topics: ['Hidrocarburos', 'Grupos funcionales', 'Reactividad', 'Polímeros']
      }
    ];

    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  // Función para manejar cambios en la búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    filterCourses(term, tabValue, filter);
  };

  // Función para manejar cambios en las pestañas
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    filterCourses(searchTerm, newValue, filter);
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (name: string, value: string | boolean) => {
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
    filterCourses(searchTerm, tabValue, newFilter);
  };

  // Función para filtrar cursos
  const filterCourses = (term: string, tab: number, filterValues: any) => {
    let result = [...courses];

    // Filtrar por término de búsqueda
    if (term) {
      result = result.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.topics.some(topic => topic.toLowerCase().includes(term))
      );
    }

    // Filtrar por pestaña/materia
    if (tab > 0) { // el índice 0 es "Todos"
      const subject = tabs[tab].label;
      result = result.filter(course => course.subject === subject);
    }

    // Filtrar por nivel
    if (filterValues.level) {
      result = result.filter(course => course.level === filterValues.level);
    }

    // Filtrar por inscripción
    if (filterValues.enrolled) {
      result = result.filter(course => course.enrolled);
    }

    setFilteredCourses(result);
  };

  // Función para inscribirse a un curso
  const handleEnrollCourse = (courseId: string) => {
    // En una implementación real, esta función enviaría una solicitud al backend
    const updatedCourses = courses.map(course =>
      course.id === courseId ? { ...course, enrolled: true } : course
    );

    setCourses(updatedCourses);
    setFilteredCourses(
      filteredCourses.map(course =>
        course.id === courseId ? { ...course, enrolled: true } : course
      )
    );
  };

  // Función para marcar curso como favorito
  const handleToggleFavorite = (courseId: string) => {
    // En una implementación real, esta función enviaría una solicitud al backend
    // Aquí solo cambiamos el estado featured como ejemplo
    const updatedCourses = courses.map(course =>
      course.id === courseId ? { ...course, featured: !course.featured } : course
    );

    setCourses(updatedCourses);
    setFilteredCourses(
      filteredCourses.map(course =>
        course.id === courseId ? { ...course, featured: !course.featured } : course
      )
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Encabezado */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Cursos de preparación ICFES
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explora nuestra selección de cursos diseñados para ayudarte a tener éxito en el examen ICFES.
        </Typography>
      </Paper>

      {/* Barra de búsqueda y filtros */}      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Buscar cursos..."
              variant="outlined"
              size="medium"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl fullWidth size="medium">
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={filter.level}
                  label="Nivel"
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Básico">Básico</MenuItem>
                  <MenuItem value="Intermedio">Intermedio</MenuItem>
                  <MenuItem value="Avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant={filter.enrolled ? "contained" : "outlined"}
                startIcon={<FilterList />}
                onClick={() => handleFilterChange('enrolled', !filter.enrolled)}
                sx={{ whiteSpace: 'nowrap', minWidth: '150px' }}
              >
                {filter.enrolled ? "Mis cursos" : "Todos los cursos"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Pestañas para materias */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Lista de cursos */}
      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron cursos con los filtros aplicados
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchTerm('');
              setTabValue(0);
              setFilter({
                subject: '',
                level: '',
                enrolled: false
              });
              setFilteredCourses(courses);
            }}
          >
            Limpiar filtros
          </Button>
        </Box>
      ) : (<Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid component="div" size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
              elevation={course.featured ? 3 : 1}
            >
              {/* Imagen del curso con overlay para cursos bloqueados */}
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={course.image}
                  alt={course.title}
                  sx={{
                    filter: course.locked ? 'brightness(0.6)' : 'none',
                  }}
                />

                {/* Indicador de curso bloqueado */}
                {course.locked && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Lock sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">
                        Curso Bloqueado
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {/* Etiqueta de materia */}
                <Chip
                  label={course.subject}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }}
                />

                {/* Botón de favorito */}
                <IconButton
                  aria-label="añadir a favoritos"
                  onClick={() => handleToggleFavorite(course.id)}
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.95)',
                    }
                  }}
                >
                  {course.featured ? (
                    <Bookmark color="primary" />
                  ) : (
                    <BookmarkBorder />
                  )}
                </IconButton>
              </Box>

              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Título del curso */}
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    mb: 1,
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    minHeight: '54px',
                  }}
                >
                  {course.title}
                </Typography>

                {/* Calificación */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Rating
                    value={course.rating}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    {course.rating}
                  </Typography>
                </Stack>

                {/* Información del instructor */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Avatar
                    src={course.instructor.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {course.instructor.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {course.instructor.name}
                  </Typography>
                </Box>

                {/* Estadísticas del curso */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.duration}
                    </Typography>
                    <Box sx={{ ml: 'auto' }} />
                    <Chip
                      label={course.level}
                      size="small"
                      color={
                        course.level === 'Básico' ? 'success' :
                          course.level === 'Intermedio' ? 'primary' : 'error'
                      }
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.completedLessons} de {course.totalLessons} lecciones
                    </Typography>
                  </Box>
                </Box>

                {/* Barra de progreso (solo para cursos inscritos) */}
                {course.enrolled && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progreso:
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 'auto' }}>
                        {course.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{
                        height: 5,
                        borderRadius: 5,
                        bgcolor: 'rgba(0,0,0,0.08)',
                      }}
                    />
                  </Box>
                )}
              </CardContent>

              <Divider />

              <CardActions>
                {course.locked ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LockOpen />}
                    fullWidth
                    onClick={() => navigate('/pricing')}
                  >
                    Desbloquear
                  </Button>
                ) : course.enrolled ? (
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForward />}
                    fullWidth
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<School />}
                    fullWidth
                    onClick={() => handleEnrollCourse(course.id)}
                  >
                    Inscribirme
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </Box>
  );
};

export default CoursesPage;
