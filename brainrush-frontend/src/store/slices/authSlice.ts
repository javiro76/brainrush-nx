import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Definimos tipos para el usuario y las credenciales
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  status: 'idle',
  error: null,
};

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // En una implementación real, aquí haríamos la llamada a la API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      );
    }
  }
);

// Thunk para registro
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      // En una implementación real, aquí haríamos la llamada a la API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al registrar usuario');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al registrar usuario'
      );
    }
  }
);

// Thunk para logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };

      if (auth.refreshToken) {
        // En una implementación real, aquí haríamos la llamada a la API
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: auth.refreshToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return rejectWithValue(errorData.message || 'Error al cerrar sesión');
        }
      }

      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al cerrar sesión'
      );
    }
  }
);

// Creación del slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Limpiar los errores
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    },

    // Establecer el usuario y token manualmente (útil para recuperar sesión)
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Guardar en localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    // Manejar login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;

        // Guardar en localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Manejar registro
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;

        // Guardar en localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Manejar logout
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Restablecer estado
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.status = 'idle';

        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Exportamos las acciones
export const { clearError, setCredentials } = authSlice.actions;

// Exportamos el reducer
export default authSlice.reducer;
