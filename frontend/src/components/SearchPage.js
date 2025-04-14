import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Link,
  Chip,
  Avatar,
} from '@mui/material';
import { Favorite, CalendarToday } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('images');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchTypeChange = (event, newType) => {
    if (newType !== null) {
      setSearchType(newType);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/search/${searchType}`,
        {
          query: searchQuery,
          search_type: searchType,
        }
      );
      setResults(response.data);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderImageCard = (item) => (
    <Grid item xs={12} sm={6} md={4} key={item.id}>
      <Card>
        <CardMedia
          component="img"
          height="250"
          image={item.urls.regular}
          alt={item.alt_description || 'Unsplash Image'}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={item.user.profile_image.medium}
              alt={item.user.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Box>
              <Typography variant="subtitle2">
                <Link
                  href={item.user.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                >
                  {item.user.name}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(item.created_at)}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            {item.description || item.alt_description || 'No description available'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Favorite sx={{ fontSize: 16, mr: 0.5, color: 'error.main' }} />
            <Typography variant="caption" color="text.secondary">
              {item.likes} likes
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            {item.tags.map((tag) => (
              <Chip
                key={tag.title}
                label={tag.title}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderCollectionCard = (item) => (
    <Grid item xs={12} sm={6} md={4} key={item.id}>
      <Card>
        <Grid container>
          {item.preview_photos?.slice(0, 4).map((photo, index) => (
            <Grid item xs={6} key={index}>
              <CardMedia
                component="img"
                height="120"
                image={photo.urls.thumb}
                alt={`Preview ${index + 1}`}
                sx={{ objectFit: 'cover' }}
              />
            </Grid>
          ))}
        </Grid>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={item.user.profile_image.medium}
              alt={item.user.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="subtitle2">
              <Link
                href={item.user.links.html}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                {item.user.name}
              </Link>
            </Typography>
          </Box>

          <Typography gutterBottom variant="h6" component="div">
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {item.description || 'No description available'}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            {item.total_photos} photos
          </Typography>

          <Box sx={{ mt: 1 }}>
            {item.tags.map((tag) => (
              <Chip
                key={tag.title}
                label={tag.title}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Describe what you're looking for..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={handleSearchTypeChange}
              fullWidth
            >
              <ToggleButton value="images">Images</ToggleButton>
              <ToggleButton value="collections">Collections</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ mt: 2 }}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {results.map((item) =>
            searchType === 'images'
              ? renderImageCard(item)
              : renderCollectionCard(item)
          )}
        </Grid>
      )}
    </Container>
  );
}

export default SearchPage; 