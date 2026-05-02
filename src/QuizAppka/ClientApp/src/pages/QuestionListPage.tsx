import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Container, Typography } from '@mui/material';
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
    if (!categoryId) {
      setError('Missing category ID');
      setLoading(false);
      return;
    }
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

  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      navigate(`/quiz/${categoryId}/${questionId}`);
    },
    [navigate, categoryId],
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress role="progressbar" />
      </Container>
    );
  }

  if (error || !category) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" role="alert">{error ?? 'Category not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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
    </Container>
  );
}
