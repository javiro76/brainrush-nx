import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SnackbarProvider } from 'notistack';

import App from './app/app';
import { useNavigate } from 'react-router-dom';

// Eliminar y volver a importar ApiService para forzar la recarga del módulo
import ApiService from './services/api.service';

function AppInitializer() {
  const navigate = useNavigate();

  // Configure ApiService to use React Router for redirection
  ApiService.setRedirectToLogin(() => navigate('/login'));

  return <App />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <AppInitializer />
        </SnackbarProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
