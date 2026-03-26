import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, CircularProgress, Container, Typography } from '@mui/material';
import { fetchCategory } from '../services/quizApi';
import type { CategoryDetail } from '../types/quiz';
import QuestionList from '../components/QuestionList';

export default function QuestionListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
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

  const handleSelectQuestion = (questionId: string) => {
    navigate(`/quiz/${categoryId}/${questionId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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
