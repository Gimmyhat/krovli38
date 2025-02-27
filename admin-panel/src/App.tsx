import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
});

const App: React.FC = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </HashRouter>
    </MantineProvider>
  );
};

export default App;
