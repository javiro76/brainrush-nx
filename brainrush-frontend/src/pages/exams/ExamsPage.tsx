import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputAdornment,
  Badge,
  Tab,
  Tabs
} from '@mui/material';
import {
  Assessment,
  AccessTime,
  CalendarToday,
  FilterList,
  Search,
  Star,
  StarBorder,
  HelpOutline,
  CheckCircleOutline,
  ArrowBack
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';

// Interfaces para los datos simulados (en una implementación real vendrían del backend)
interface Exam {
  id: string;
  title: string;
  description: string;
  type: 'Simulacro' | 'Práctica' | 'Quiz';
  subject: string;
  questionsCount: number;
  timeInMinutes: number;
  date: string;
  completed: boolean;
  favorite: boolean;
  difficulty: 'Fácil' | 'Intermedio' | 'Difícil';
  topics: string[];
}

const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    completed: '',
    favorite: false
  });

  // Tabs para organizar los exámenes
  const tabs = [
    { label: 'Todos', value: 'all' },
    { label: 'Simulacros', value: 'Simulacro' },
    { label: 'Prácticas', value: 'Práctica' },
    { label: 'Quizzes', value: 'Quiz' },
  ];

  // En una implementación real, aquí haríamos fetch de los datos desde el backend
  useEffect(() => {
    // Datos simulados para mostrar en la página de exámenes
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'Simulacro ICFES Completo',
        description: 'Simulacro completo tipo ICFES que cubre todas las áreas evaluadas en el examen real.',
        type: 'Simulacro',
        subject: 'General',
        questionsCount: 120,
        timeInMinutes: 180,
        date: '2023-11-15',
        completed: false,
        favorite: true,
        difficulty: 'Difícil',
        topics: ['Matemáticas', 'Lenguaje', 'Ciencias Sociales', 'Ciencias Naturales', 'Inglés']
      },
      {
        id: '2',
        title: 'Examen de Matemáticas',
        description: 'Práctica de matemáticas enfocada en álgebra y cálculo básico.',
        type: 'Práctica',
        subject: 'Matemáticas',
        questionsCount: 40,
        timeInMinutes: 60,
        date: '2023-11-10',
        completed: false,
        favorite: false,
        difficulty: 'Intermedio',
        topics: ['Álgebra', 'Geometría', 'Cálculo']
      },
      {
        id: '3',
        title: 'Quiz de Lectura Crítica',
        description: 'Quiz rápido para evaluar comprensión de lectura y análisis de textos.',
        type: 'Quiz',
        subject: 'Lenguaje',
        questionsCount: 15,
        timeInMinutes: 20,
        date: '2023-11-05',
        completed: true,
        favorite: false,
        difficulty: 'Fácil',
        topics: ['Comprensión lectora', 'Análisis de texto']
      },
      {
        id: '4',
        title: 'Simulacro Parcial - Ciencias',
        description: 'Simulacro enfocado en las áreas de ciencias naturales.',
        type: 'Simulacro',
        subject: 'Ciencias Naturales',
        questionsCount: 60,
        timeInMinutes: 90,
        date: '2023-11-20',
        completed: false,
        favorite: true,
        difficulty: 'Intermedio',
        topics: ['Física', 'Química', 'Biología']
      },
      {
        id: '5',
        title: 'Práctica de Inglés',
        description: 'Examen completo para preparar la sección de inglés del ICFES.',
        type: 'Práctica',
        subject: 'Inglés',
        questionsCount: 30,
        timeInMinutes: 45,
        date: '2023-11-12',
        completed: true,
        favorite: false,
        difficulty: 'Intermedio',
        topics: ['Reading', 'Grammar']
      },
      {
        id: '6',
        title: 'Quiz Rápido - Historia de Colombia',
        description: 'Evaluación rápida sobre eventos importantes de la historia colombiana.',
        type: 'Quiz',
        subject: 'Ciencias Sociales',
        questionsCount: 10,
        timeInMinutes: 15,
        date: '2023-11-08',
        completed: true,
        favorite: true,
        difficulty: 'Fácil',
        topics: ['Historia', 'Geografía']
      }
    ];

    setExams(mockExams);
    setFilteredExams(mockExams);
  }, []);

  // Función para filtrar exámenes por tab
  const filterByTab = (tab: number) => {
    setCurrentTab(tab);

    if (tab === 0) {
      // "Todos" tab
      applyFilters(exams);
    } else {
      // Filter by exam type
      const examType = tabs[tab].value as 'Simulacro' | 'Práctica' | 'Quiz';
      applyFilters(exams.filter(exam => exam.type === examType));
    }
  };

  // Función para buscar exámenes
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      filterByTab(currentTab);
    } else {
      const baseExams = currentTab === 0 ? exams : exams.filter(exam => exam.type === tabs[currentTab].value);
      const searched = baseExams.filter(exam =>
        exam.title.toLowerCase().includes(term) ||
        exam.description.toLowerCase().includes(term) ||
        exam.subject.toLowerCase().includes(term) ||
        exam.topics.some(topic => topic.toLowerCase().includes(term))
      );

      applyFilters(searched);
    }
  };

  // Función para aplicar filtros
  const applyFilters = (baseExams: Exam[]) => {
    let result = [...baseExams];

    if (filters.difficulty) {
      result = result.filter(exam => exam.difficulty === filters.difficulty);
    }

    if (filters.completed === 'completed') {
      result = result.filter(exam => exam.completed);
    } else if (filters.completed === 'pending') {
      result = result.filter(exam => !exam.completed);
    }

    if (filters.favorite) {
      result = result.filter(exam => exam.favorite);
    }

    setFilteredExams(result);
  };

  // Función para manejar la apertura del diálogo de examen
  const handleOpenExamDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Función para iniciar el examen
  const startExam = () => {
    if (selectedExam) {
      // En una implementación real, aquí redirigimos al simulacro/examen
      navigate(`/exams/${selectedExam.id}/start`);
    }
    setOpenDialog(false);
  };

  // Función para abrir el diálogo de filtros
  const handleOpenFilterDialog = () => {
    setFilterDialog(true);
  };

  // Función para cerrar el diálogo de filtros
  const handleCloseFilterDialog = () => {
    setFilterDialog(false);
  };

  // Función para aplicar los filtros seleccionados
  const handleApplyFilters = () => {
    let baseExams = exams;

    if (currentTab !== 0) {
      baseExams = exams.filter(exam => exam.type === tabs[currentTab].value);
    }

    // Aplicar búsqueda si existe
    if (searchTerm !== '') {
      baseExams = baseExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm) ||
        exam.description.toLowerCase().includes(searchTerm) ||
        exam.subject.toLowerCase().includes(searchTerm) ||
        exam.topics.some(topic => topic.toLowerCase().includes(searchTerm))
      );
    }

    applyFilters(baseExams);
    setFilterDialog(false);
  };

  // Función para marcar/desmarcar como favorito
  const toggleFavorite = (examId: string) => {
    const updatedExams = exams.map(exam =>
      exam.id === examId ? { ...exam, favorite: !exam.favorite } : exam
    );
    setExams(updatedExams);

    // Actualizar también los filteredExams
    const updatedFilteredExams = filteredExams.map(exam =>
      exam.id === examId ? { ...exam, favorite: !exam.favorite } : exam
    );
    setFilteredExams(updatedFilteredExams);
  };

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
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar exámenes..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleOpenFilterDialog}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Pestañas para categorías de exámenes */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => filterByTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                tab.label === 'Todos' ? tab.label : (
                  <Badge
                    badgeContent={exams.filter(exam => exam.type === tab.value).length}
                    color="primary"
                  >
                    {tab.label}
                  </Badge>
                )
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Lista de exámenes */}
      {filteredExams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <HelpOutline sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron exámenes con los filtros aplicados
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchTerm('');
              setFilters({
                type: '',
                difficulty: '',
                completed: '',
                favorite: false
              });
              setFilteredExams(exams);
              setCurrentTab(0);
            }}
          >
            Limpiar filtros
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredExams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} key={exam.id}>
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
                  onClick={() => toggleFavorite(exam.id)}
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
                    onClick={() => handleOpenExamDialog(exam)}
                    fullWidth
                  >
                    {exam.completed ? 'Revisar' : (exam.type === 'Simulacro' ? 'Comenzar' : 'Practicar')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo de información del examen */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedExam && (
          <>
            <DialogTitle>
              {selectedExam.title}
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
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
                  label={selectedExam.type}
                  color={
                    selectedExam.type === 'Simulacro' ? 'primary' :
                      selectedExam.type === 'Práctica' ? 'info' : 'default'
                  }
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={selectedExam.subject}
                  variant="outlined"
                />
              </Box>

              <DialogContentText gutterBottom>
                {selectedExam.description}
              </DialogContentText>

              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del examen:
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Assessment fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedExam.questionsCount} preguntas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedExam.timeInMinutes} minutos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Disponible desde: {new Date(selectedExam.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Dificultad: {selectedExam.difficulty}
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
                  {selectedExam.topics.map((topic, index) => (
                    <Chip key={index} label={topic} size="small" />
                  ))}
                </Box>
              </Box>

              {selectedExam.completed && (
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
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={startExam}
                autoFocus
              >
                {selectedExam.completed ? 'Revisar Resultados' : 'Iniciar Examen'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo de filtros */}
      <Dialog
        open={filterDialog}
        onClose={handleCloseFilterDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Filtrar exámenes</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 1, width: '100%' }}>
            <FormLabel component="legend">Dificultad</FormLabel>
            <RadioGroup
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
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
                  onChange={(e) => setFilters({ ...filters, favorite: e.target.checked })}
                />
              }
              label="Solo favoritos"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamsPage;
