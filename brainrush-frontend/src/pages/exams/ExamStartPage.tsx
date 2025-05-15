import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  ButtonGroup,
  Alert
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Flag,
  Check,
  Bookmark,
  BookmarkBorder,
  Close,
  AccessTime,
  HelpOutline,
  ArrowBack,
  FormatListBulleted
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';

// Interfaces para los datos simulados
interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  answer?: string;
  marked: boolean;
  correctAnswer?: string; // Solo se usará al finalizar el examen
  explanation?: string; // Explicación de la respuesta correcta
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  timeInMinutes: number;
  questions: Question[];
}

const ExamStartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { examId } = useParams<{ examId: string }>();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Estados para el manejo del examen
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [confirmSubmitDialog, setConfirmSubmitDialog] = useState(false);
  const [confirmExitDialog, setConfirmExitDialog] = useState(false);
  const [questionsListOpen, setQuestionsListOpen] = useState(false);

  // Carga de datos del examen (simulados)
  useEffect(() => {
    // Simulamos una petición a la API
    setLoading(true);
    setTimeout(() => {
      // Datos simulados para el examen
      const mockExam: ExamData = {
        id: examId || '1',
        title: 'Simulacro ICFES - Matemáticas',
        description: 'Evaluación de habilidades matemáticas para el examen ICFES',
        timeInMinutes: 45,
        questions: Array(20).fill(null).map((_, index) => ({
          id: index + 1,
          text: `Esta es la pregunta ${index + 1} del examen. ${index % 3 === 0 ? 'Si un triángulo tiene lados de 3, 4 y 5 unidades, ¿cuál es su área?' :
            index % 3 === 1 ? 'Si f(x) = 2x² - 3x + 1, ¿cuál es el valor de f(2)?' :
              'Una caja contiene 6 bolas rojas, 4 azules y 2 verdes. Al extraer una bola al azar, ¿cuál es la probabilidad de que sea roja o verde?'}`,
          options: [
            { id: 'A', text: `Opción A para la pregunta ${index + 1}` },
            { id: 'B', text: `Opción B para la pregunta ${index + 1}` },
            { id: 'C', text: `Opción C para la pregunta ${index + 1}` },
            { id: 'D', text: `Opción D para la pregunta ${index + 1}` }
          ],
          marked: false,
          correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          explanation: 'Esta es una explicación detallada de por qué esta respuesta es la correcta. Aquí se explica el razonamiento lógico y matemático para llegar a la solución.'
        }))
      };

      setExam(mockExam);
      setTimeLeft(mockExam.timeInMinutes * 60);
      setLoading(false);
    }, 1500);
  }, [examId]);

  // Temporizador del examen
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (examStarted && timeLeft > 0 && !examFinished) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examStarted) {
      finishExam();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [examStarted, timeLeft]);

  // Formatear el tiempo restante en formato mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Porcentaje de tiempo restante
  const timePercentage = exam ? (timeLeft / (exam.timeInMinutes * 60)) * 100 : 100;

  // Iniciar el examen
  const startExam = () => {
    setExamStarted(true);
  };

  // Marcar o desmarcar una pregunta para revisión
  const toggleMarkQuestion = (index: number) => {
    if (exam) {
      const newQuestions = [...exam.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        marked: !newQuestions[index].marked
      };

      setExam({
        ...exam,
        questions: newQuestions
      });

      if (newQuestions[index].marked) {
        setMarkedQuestions([...markedQuestions, index]);
      } else {
        setMarkedQuestions(markedQuestions.filter(q => q !== index));
      }
    }
  };

  // Manejar cambio de respuesta en una pregunta
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });

    if (exam) {
      const updatedQuestions = [...exam.questions];
      updatedQuestions[currentQuestionIndex].answer = value;

      setExam({
        ...exam,
        questions: updatedQuestions
      });
    }
  };

  // Navegar a la siguiente pregunta
  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // Navegar a la pregunta anterior
  const handleBack = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  // Navegar a una pregunta específica
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setQuestionsListOpen(false);
  };

  // Finalizar el examen
  const finishExam = () => {
    setExamFinished(true);
    setConfirmSubmitDialog(false);

    // Calcular resultados
    if (exam) {
      let correctCount = 0;

      exam.questions.forEach(question => {
        if (question.answer === question.correctAnswer) {
          correctCount++;
        }
      });

      // En una implementación real, enviaríamos los resultados al backend
      console.log('Examen finalizado');
      console.log('Respuestas correctas:', correctCount);
      console.log('Total de preguntas:', exam.questions.length);

      setTimeout(() => {
        setShowResults(true);
      }, 1500);
    }
  };

  // Calcular resultados
  const calculateResults = () => {
    if (!exam) return { correctCount: 0, incorrectCount: 0, score: 0 };

    let correctCount = 0;
    let incorrectCount = 0;

    exam.questions.forEach(question => {
      if (question.answer === question.correctAnswer) {
        correctCount++;
      } else if (question.answer) {
        incorrectCount++;
      }
    });

    const unansweredCount = exam.questions.length - correctCount - incorrectCount;
    const score = Math.round((correctCount / exam.questions.length) * 100);

    return {
      correctCount,
      incorrectCount,
      unansweredCount,
      score
    };
  };

  // Verificar si todas las preguntas han sido respondidas
  const allQuestionsAnswered = () => {
    return exam ? exam.questions.every(q => q.answer) : false;
  };

  // Número de preguntas respondidas
  const answeredCount = () => {
    return exam ? exam.questions.filter(q => q.answer).length : 0;
  };

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
          Cargando examen...
        </Typography>
      </Box>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/exams')}
          sx={{ mt: 2 }}
        >
          Volver a exámenes
        </Button>
      </Box>
    );
  }

  // Si no hay examen, mostrar mensaje
  if (!exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontró el examen solicitado.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/exams')}
          sx={{ mt: 2 }}
        >
          Volver a exámenes
        </Button>
      </Box>
    );
  }

  // Si el examen no ha comenzado, mostrar pantalla de inicio
  if (!examStarted) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <IconButton
              sx={{ mr: 1 }}
              onClick={() => navigate(`/exams`)}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" component="h1" display="inline">
              {exam.title}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">
              {exam.description}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información del examen
            </Typography>            <Grid container spacing={2}>
              <Grid component="div" size={6}>
                <Typography variant="body1">
                  <Box component="span" fontWeight="bold">Preguntas:</Box> {exam.questions.length}
                </Typography>
              </Grid>
              <Grid component="div" size={6}>
                <Typography variant="body1">
                  <Box component="span" fontWeight="bold">Duración:</Box> {exam.timeInMinutes} minutos
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instrucciones
            </Typography>

            <Typography variant="body2" paragraph>
              • Lee cuidadosamente cada pregunta y todas las opciones de respuesta.
            </Typography>
            <Typography variant="body2" paragraph>
              • Cada pregunta tiene una única respuesta correcta.
            </Typography>
            <Typography variant="body2" paragraph>
              • Puedes marcar preguntas para revisarlas posteriormente.
            </Typography>
            <Typography variant="body2" paragraph>
              • El examen terminará automáticamente cuando se acabe el tiempo.
            </Typography>
            <Typography variant="body2" paragraph>
              • Si terminas antes, puedes enviar tu examen haciendo clic en el botón "Finalizar examen".
            </Typography>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={startExam}
              sx={{ px: 4, py: 1.5 }}
            >
              Comenzar examen
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Si el examen ha terminado pero aún no se muestran los resultados
  if (examFinished && !showResults) {
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
          Procesando resultados...
        </Typography>
      </Box>
    );
  }

  // Si se están mostrando los resultados
  if (showResults) {
    const results = calculateResults();

    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Resultados del Examen
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}>
            <Box sx={{
              position: 'relative',
              display: 'inline-flex',
              mb: 2
            }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={4}
                sx={{
                  color: theme.palette.grey[200],
                  position: 'absolute'
                }}
              />
              <CircularProgress
                variant="determinate"
                value={results.score}
                size={120}
                thickness={4}
                sx={{
                  color: results.score >= 70 ?
                    'success.main' :
                    results.score >= 50 ?
                      'warning.main' :
                      'error.main'
                }}
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
                  variant="h4"
                  component="div"
                  color="text.secondary"
                >
                  {results.score}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" align="center">
              {results.score >= 80 ? '¡Excelente trabajo!' :
                results.score >= 70 ? '¡Buen trabajo!' :
                  results.score >= 50 ? 'Puedes mejorar' :
                    'Necesitas más práctica'}
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid component="div" size={{ xs: 12, sm: 4 }}>
              <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h4">
                    {results.correctCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respuestas correctas
                  </Typography>
                </CardContent>              </Card>
            </Grid>
            <Grid component="div" size={{ xs: 12, sm: 4 }}>
              <Card sx={{ textAlign: 'center', bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="h4">
                    {results.incorrectCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respuestas incorrectas
                  </Typography>
                </CardContent>              </Card>
            </Grid>
            <Grid component="div" size={{ xs: 12, sm: 4 }}>
              <Card sx={{ textAlign: 'center', bgcolor: 'grey.100' }}>
                <CardContent>
                  <Typography variant="h4">
                    {results.unansweredCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sin responder
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Revisión de preguntas
          </Typography>

          {exam.questions.map((question, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Pregunta {index + 1}
                </Typography>
                {question.answer === question.correctAnswer ? (
                  <Chip
                    icon={<Check />}
                    label="Correcta"
                    color="success"
                    size="small"
                  />
                ) : question.answer ? (
                  <Chip
                    icon={<Close />}
                    label="Incorrecta"
                    color="error"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Sin responder"
                    color="default"
                    size="small"
                  />
                )}
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {question.text}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {question.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={
                      <Radio
                        checked={question.answer === option.id}
                        color={
                          option.id === question.correctAnswer ? 'success' :
                            question.answer === option.id ? 'error' : 'default'
                        }
                        disabled
                      />
                    }
                    label={
                      <Box component="span" sx={{
                        color: option.id === question.correctAnswer ? 'success.main' :
                          question.answer === option.id && option.id !== question.correctAnswer ? 'error.main' : 'inherit'
                      }}>
                        {option.id}: {option.text}
                        {option.id === question.correctAnswer && (
                          <Check color="success" fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                        )}
                      </Box>
                    }
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Box>

              {question.explanation && (
                <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Explicación:
                  </Typography>
                  <Typography variant="body2">
                    {question.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/exams')}
            >
              Volver a exámenes
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Vista principal del examen en curso
  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Cabecera con tiempo y progreso */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: theme.palette.background.default
      }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid component="div">
            <IconButton onClick={() => setConfirmExitDialog(true)}>
              <ArrowBack />
            </IconButton>          </Grid>
          <Grid component="div" size="grow">
            <Typography variant="h6" noWrap>
              {exam.title}
            </Typography>          </Grid>
          <Grid component="div">
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              border: 1,
              borderColor: timePercentage < 30 ? 'error.main' : timePercentage < 50 ? 'warning.main' : 'primary.main',
              borderRadius: 1,
              bgcolor: timePercentage < 30 ? 'error.light' : timePercentage < 50 ? 'warning.light' : 'primary.light',
            }}>
              <AccessTime sx={{ mr: 1, color: timePercentage < 30 ? 'error.main' : timePercentage < 50 ? 'warning.main' : 'primary.main' }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  color: timePercentage < 30 ? 'error.main' : timePercentage < 50 ? 'warning.main' : 'primary.main'
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <LinearProgress
          variant="determinate"
          value={(currentQuestionIndex / exam.questions.length) * 100}
          sx={{ mt: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            Pregunta {currentQuestionIndex + 1} de {exam.questions.length}
          </Typography>
          <Button
            size="small"
            onClick={() => setQuestionsListOpen(true)}
            startIcon={<FormatListBulleted />}
          >
            Ver todas ({answeredCount()}/{exam.questions.length})
          </Button>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Paper elevation={2} sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
          {/* Número y texto de la pregunta */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`Pregunta ${currentQuestionIndex + 1}`}
                color="primary"
                sx={{ mr: 1 }}
              />
              {currentQuestion.marked && (
                <Chip
                  icon={<Flag />}
                  label="Marcada para revisión"
                  color="secondary"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="h6">
              {currentQuestion.text}
            </Typography>
          </Box>

          {/* Opciones de respuesta */}
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={currentQuestion.answer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options.map((option) => (
                <Paper
                  key={option.id}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    p: 0,
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    borderColor: currentQuestion.answer === option.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <FormControlLabel
                    value={option.id}
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1">
                        <Box component="span" fontWeight="bold" mr={1}>
                          {option.id}.
                        </Box>
                        {option.text}
                      </Typography>
                    }
                    sx={{
                      width: '100%',
                      m: 0,
                      p: 2
                    }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      </Box>

      {/* Botones de navegación */}
      <Box sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Button
            color="inherit"
            onClick={() => toggleMarkQuestion(currentQuestionIndex)}
            startIcon={currentQuestion.marked ? <Bookmark /> : <BookmarkBorder />}
          >
            {currentQuestion.marked ? 'Desmarcar' : 'Marcar'} para revisión
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            disabled={currentQuestionIndex === 0}
            onClick={handleBack}
            startIcon={<KeyboardArrowLeft />}
          >
            Anterior
          </Button>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<KeyboardArrowRight />}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => setConfirmSubmitDialog(true)}
              endIcon={<Check />}
            >
              Finalizar examen
            </Button>
          )}
        </Box>
      </Box>

      {/* Diálogo de confirmación para finalizar el examen */}
      <Dialog
        open={confirmSubmitDialog}
        onClose={() => setConfirmSubmitDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>¿Finalizar examen?</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph>
              Estás a punto de finalizar el examen.
            </Typography>

            {!allQuestionsAnswered() && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Hay {exam.questions.length - answeredCount()} preguntas sin responder.
              </Alert>
            )}

            <Typography variant="body2">
              Una vez finalizado, no podrás cambiar tus respuestas.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmitDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={finishExam}
            autoFocus
          >
            Finalizar examen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para salir del examen */}
      <Dialog
        open={confirmExitDialog}
        onClose={() => setConfirmExitDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>¿Abandonar examen?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Si abandonas el examen ahora, perderás todo tu progreso.
          </Alert>
          <Typography variant="body2">
            ¿Estás seguro de que deseas abandonar el examen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmExitDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate('/exams')}
            autoFocus
          >
            Abandonar examen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para ver todas las preguntas */}
      <Dialog
        open={questionsListOpen}
        onClose={() => setQuestionsListOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Preguntas del examen
          <IconButton
            aria-label="close"
            onClick={() => setQuestionsListOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Resueltas: {answeredCount()} de {exam.questions.length}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {exam.questions.map((question, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => goToQuestion(index)}
                  selected={index === currentQuestionIndex}
                  sx={{
                    borderRadius: 1,
                    border: 1,
                    borderColor: question.marked ? 'secondary.main' : 'divider',
                  }}
                >
                  <ListItemText
                    primary={`Pregunta ${index + 1}`}
                    secondary={question.text.length > 60 ? `${question.text.substring(0, 60)}...` : question.text}
                  />
                  {question.answer ? (
                    <Chip
                      label={question.answer}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Chip
                      label="Sin responder"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {question.marked && (
                    <Bookmark
                      color="secondary"
                      sx={{ ml: 1 }}
                      fontSize="small"
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setQuestionsListOpen(false)}
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamStartPage;
