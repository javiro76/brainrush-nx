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
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useRegisterNotifications } from '../../hooks/useRegisterNotifications';
import { registerRequest } from '../../store/slices/auth/auth.actions';

// Esquema de validación con Yup
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Nombre demasiado corto')
    .max(50, 'Nombre demasiado largo')
    .required('Nombre es requerido'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerido'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
});

// Interfaz para los valores del formulario
interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, result, user } = useAppSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redireccionar al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Manejar las notificaciones de registro
  useRegisterNotifications(result);

  // Valores iniciales para el formulario
  const initialValues: RegisterFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  // Manejar la visibilidad de las contraseñas
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Manejar el envío del formulario
  const handleSubmit = (
    values: RegisterFormValues,
    { setSubmitting }: FormikHelpers<RegisterFormValues>
  ) => {
    dispatch(registerRequest({
      name: values.name,
      email: values.email,
      password: values.password
    }));

    // Formik manejará el estado de envío, pero lo dejamos aquí por seguridad
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
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
            Crear cuenta
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form style={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid component="div" size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="name"
                      name="name"
                      label="Nombre completo"
                      variant="outlined"
                      autoComplete="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
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
                      helperText={touched.email && errors.email}
                    />
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
                      autoComplete="new-password"
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
                  <Grid component="div" size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirmar contraseña"
                      type={showConfirmPassword ? 'text' : 'password'}
                      variant="outlined"
                      autoComplete="new-password"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid component="div" size={12}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Checkbox}
                          name="acceptTerms"
                          color="primary"
                          checked={values.acceptTerms}
                        />
                      }
                      label="Acepto los términos y condiciones"
                    />
                    {touched.acceptTerms && errors.acceptTerms && (
                      <Typography color="error" variant="caption" display="block">
                        {errors.acceptTerms}
                      </Typography>
                    )}
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
                        'Registrarme'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>

          {/* Enlace de inicio de sesión */}
          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid component="div">
              <Link component={RouterLink} to="/login" variant="body2">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
