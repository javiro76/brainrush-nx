import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  Avatar,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Equalizer as EqualizerIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  BookmarkBorder as BookmarkIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { toggleThemeMode } from '../../store/slices/theme/theme.actions';
import { logoutRequest } from '../../store/slices/auth/auth.actions';

// Ancho del drawer lateral
const drawerWidth = 240;

/**
 * Layout principal de la aplicación
 *
 * Contiene la barra de navegación superior, el menú lateral y el contenido principal
 */
const MainLayout = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);

  // Estado para controlar si el drawer está abierto
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Manejador para abrir/cerrar el drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Manejador para cambiar el tema
  const handleThemeToggle = () => {
    dispatch(toggleThemeMode());
  };

  // Manejador para cerrar sesión
  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  // Estructura de navegación del menú lateral
  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Mis Cursos',
      icon: <SchoolIcon />,
      path: '/courses'
    },
    {
      text: 'Exámenes y Simulacros',
      icon: <AssignmentIcon />,
      path: '/exams'
    },
    {
      text: 'Estadísticas',
      icon: <EqualizerIcon />,
      path: '/stats'
    },
    {
      text: 'Favoritos',
      icon: <BookmarkIcon />,
      path: '/bookmarks'
    }
  ];

  const userItems = [
    {
      text: 'Perfil',
      icon: <AccountCircleIcon />,
      path: '/profile'
    },
    {
      text: 'Notificaciones',
      icon: <NotificationsIcon />,
      path: '/notifications',
      badge: 3 // Número ficticio de notificaciones
    },
    {
      text: 'Configuración',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra de navegación superior */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard')}
            >
              BrainRush
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Botones de acción en la barra superior */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Botón de cambio de tema */}
            <Tooltip title={theme.palette.mode === 'dark' ? "Modo claro" : "Modo oscuro"}>
              <IconButton color="inherit" onClick={handleThemeToggle} sx={{ ml: 1 }}>
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Avatar del usuario */}
            <Tooltip title="Perfil">
              <IconButton
                color="inherit"
                onClick={() => navigate('/profile')}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : theme.spacing(7),
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : theme.spacing(7),
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />        {/* Lista de opciones del menú */}
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  bgcolor: location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'rgba(0, 0, 0, 0.08)'
                    : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'primary.main'
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: drawerOpen ? 1 : 0,
                    color: location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'primary.main'
                      : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Opciones de usuario */}
        <List>
          {userItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: drawerOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                sx={{ opacity: drawerOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Contenido principal */}      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          overflow: 'auto',
          height: 'calc(100vh - 64px)', // 64px es la altura del AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
