import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Container, Typography } from '@mui/material';
import CategoryList from '../components/CategoryList';
import { fetchCategories } from '../services/quizApi';
import type { CategorySummary } from '../types/quiz';

export default function HomePage() {
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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress role="progressbar" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" role="alert">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Quiz Categories</Typography>
      <CategoryList categories={categories} />
    </Container>
  );
}
