import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CategoryList from '../components/CategoryList';
import { fetchCategories } from '../services/quizApi';
import { usePresenterSession } from '../hooks/usePresenterSession';
import type { CategorySummary } from '../types/quiz';

export default function HomePage() {
  usePresenterSession({ screen: 'category-list' });
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress role="progressbar" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            <Alert severity="error" role="alert">{error}</Alert>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box data-testid="page-layout" sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
      <Grid container columns={12}>
        <Grid size={10} offset={1}>
          <Typography variant="h4" gutterBottom>Quiz Categories</Typography>
          <Button
            variant="outlined"
            href="/mirror"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2 }}
          >
            Open Mirror View
          </Button>
          <CategoryList categories={categories} />
        </Grid>
      </Grid>
    </Box>
  );
}
