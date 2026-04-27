import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { fetchCategory } from '../services/quizApi';
import { usePresenterSession } from '../hooks/usePresenterSession';
import type { CategoryDetail } from '../types/quiz';
import QuestionList from '../components/QuestionList';

export default function QuestionListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  usePresenterSession({ screen: 'question-list', categoryId: categoryId ?? '' });
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetchCategory(categoryId)
      .then((data) => {
        setCategory(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load category');
        setLoading(false);
      });
  }, [categoryId]);

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

  if (error || !category) {
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            <Alert severity="error" role="alert">{error ?? 'Category not found'}</Alert>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const handleSelectQuestion = (questionId: string) => {
    navigate(`/quiz/${categoryId}/${questionId}`);
  };

  return (
    <Box data-testid="page-layout" sx={{ width: '100%', minHeight: '100vh', pt: 4 }}>
      <Grid container columns={12}>
        <Grid size={10} offset={1}>
          <Button variant="text" onClick={() => navigate('/')} sx={{ mb: 2 }} aria-label="Back to categories">
            ← Back to categories
          </Button>
          <Typography variant="h4" gutterBottom>{category.name}</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
          </Typography>
          <QuestionList
            questions={category.questions}
            onSelectQuestion={handleSelectQuestion}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
