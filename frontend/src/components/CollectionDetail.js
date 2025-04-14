import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  CardMedia,
  Button,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const [collectionResponse, imagesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/collections/${id}`),
          Promise.all(
            collectionResponse.data.image_ids.map((imageId) =>
              axios.get(`${API_BASE_URL}/images/${imageId}`)
            )
          ),
        ]);

        setCollection(collectionResponse.data);
        setImages(imagesResponse.map((response) => response.data));
      } catch (err) {
        setError('Failed to load collection details');
        console.error('Error fetching collection:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
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

  if (!collection) {
    return (
      <Container>
        <Typography>Collection not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {collection.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {collection.description}
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            {collection.labels.map((label) => (
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

      <Typography variant="h5" gutterBottom>
        Images in this Collection
      </Typography>
      <Grid container spacing={3}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={image.url}
                alt={image.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {image.title}
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/images/${image.id}`}
                  variant="outlined"
                  size="small"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CollectionDetail; 