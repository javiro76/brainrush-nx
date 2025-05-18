import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { loginFailure, loginRequest } from '../../store/slices/auth/auth.actions';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { isActionOf } from '../../utils/redux/index';
import { useSnackbar, VariantType } from 'notistack';

// Esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida')
});

// Interfaz para los valores del formulario
interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, result, user } = useAppSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Redireccionar al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Valores iniciales para el formulario
  const initialValues: LoginFormValues = {
    email: '',
    password: ''
  };  useEffect(() => {
    if (isActionOf(result.actionType, loginFailure)) {
      // Determinar el mensaje basado en el código de estado HTTP
      let errorMessage = result.messageUser || result.messageInternal || 'Error durante el inicio de sesión';
      let variant:VariantType = 'default';
      const statusCode = 400;

      // Personalizar mensajes según código de estado
      if (statusCode) {
        switch (result.statusCode) {
          case 400:
            errorMessage = 'Datos de inicio de sesión inválidos. Por favor verifica la información.';
            variant = 'warning';
            break;
          case 401:
            errorMessage = 'Credenciales incorrectas. Revisa tu correo y contraseña.';
            break;
          case 403:
            errorMessage = 'Tu cuenta está bloqueada o desactivada. Contacta al administrador.';
            break;
          case 404:
            errorMessage = 'Usuario no encontrado. Verifica tu correo electrónico.';
            break;
          case 500:
            errorMessage = 'Error en el servidor. Intenta más tarde.';
            break;
          default:
            // Usar el mensaje por defecto ya asignado
            break;
        }
      }

      enqueueSnackbar(errorMessage, { variant });
      console.error('Error de inicio de sesión:', result);
    }
  }, [result, enqueueSnackbar]);

  // Manejar la visibilidad de la contraseña
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Manejar el envío del formulario
  const handleSubmit = (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    console.log('Enviando formulario con:', values); // Para verificar que llega aquí
    dispatch(loginRequest({
      email: values.email,
      password: values.password
    }));

    // Formik manejará el estado de envío, pero lo dejamos aquí por seguridad
    setSubmitting(false);
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper
          elevation={5}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <School
              color="primary"
              sx={{ fontSize: 40, mr: 1 }}
            />
            <Typography component="h1" variant="h4">
              BrainRush
            </Typography>
          </Box>

          <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form
                style={{ width: '100%' }}
              >
                <Grid container spacing={2}>
                  <Grid component="div" size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="email"
                      name="email"
                      label="Correo electrónico"
                      variant="outlined"
                      autoComplete="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email} />
                  </Grid>
                  <Grid component="div" size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="password"
                      name="password"
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      autoComplete="current-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Mostrar error del servidor si existe */}
                  {/* {error && (
                    <Grid component="div" size={12}>
                      <Typography color="error" variant="body2" align="center">
                        {error}
                      </Typography>
                    </Grid>
                  )} */}

                  <Grid component="div" size={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={status === 'loading' || isSubmitting}
                      sx={{ mt: 1 }}
                    >
                      {status === 'loading' ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Ingresar'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>

          {/* Enlaces adicionales */}          <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
            <Grid component="div">
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                ¿Olvidaste tu contraseña?
              </Link>            </Grid>
            <Grid component="div">
              <Link component={RouterLink} to="/register" variant="body2">
                ¿No tienes cuenta? Regístrate
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
