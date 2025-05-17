import { Route, Routes, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from '../styles/theme';

// Layout principal y páginas
import MainLayout from '../components/layout/MainLayout';
import { LoginPage, RegisterPage } from '../pages/auth';
import DashboardPage from '../pages/dashboard/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Páginas de exámenes
import { ExamStartPage, ExamsPage } from '../pages/exams';

// Páginas de cursos
import { CourseDetailPage, CoursesPage } from '../pages/courses';

export function App() {
  // Obtener el tema actual del store de Redux
  const themeMode = useAppSelector((state) => state.theme.mode);

  // Crear el tema basado en el modo actual
  const theme = createAppTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Rutas para exámenes */}
          <Route path="exams">
            <Route index element={<ExamsPage />} />
            <Route path=":examId/start" element={<ExamStartPage />} />
          </Route>

          {/* Rutas para cursos */}
          <Route path="courses">
            <Route index element={<CoursesPage />} />
            <Route path=":courseId" element={<CourseDetailPage />} />
          </Route>
        </Route>

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
