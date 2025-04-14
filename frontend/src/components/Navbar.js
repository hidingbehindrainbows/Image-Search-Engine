import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Image Search
        </Typography>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
        >
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 