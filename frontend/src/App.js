import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SearchPage from './components/SearchPage';
import ImageDetail from './components/ImageDetail';
import CollectionDetail from './components/CollectionDetail';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/images/:id" element={<ImageDetail />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 