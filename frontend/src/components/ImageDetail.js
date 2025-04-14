import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function ImageDetail() {
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/images/${id}`);
        setImage(response.data);
      } catch (err) {
        setError('Failed to load image details');
        console.error('Error fetching image:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!image) {
    return (
      <Container>
        <Typography>Image not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="500"
          image={image.url}
          alt={image.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {image.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {image.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {image.labels.map((label) => (
              <Typography
                key={label}
                variant="caption"
                sx={{
                  mr: 1,
                  backgroundColor: 'primary.light',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ImageDetail; 