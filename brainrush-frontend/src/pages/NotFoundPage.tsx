import { Container, Box, Typography } from '@mui/material';

/**
 * Página 404 Not Found
 */
const NotFoundPage = () => {
  return (
    <Container>
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
        <Typography variant="h1" color="primary" gutterBottom>
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Página no encontrada
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
