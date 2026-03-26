import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, CircularProgress, Container, Typography } from '@mui/material';
import { fetchCategory } from '../services/quizApi';
import type { CategoryDetail } from '../types/quiz';
import QuestionDisplay from '../components/QuestionDisplay';
import NavigationBar from '../components/NavigationBar';

export default function QuizPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress role="progressbar" />
      </Container>
    );
  }

  if (error || !category) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" role="alert">{error ?? 'Category not found'}</Alert>
      </Container>
    );
  }

  const questions = category.questions;
  const currentQuestion = questions[questionIndex];
  const isAtEnd = questionIndex >= questions.length - 1;

  const handleNext = () => {
    setQuestionIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    setQuestionIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>{category.name}</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom aria-live="polite" aria-atomic="true">
        Question {questionIndex + 1} of {questions.length}
      </Typography>
      {currentQuestion && <QuestionDisplay question={currentQuestion} />}
      <NavigationBar
        index={questionIndex}
        total={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      {isAtEnd && (
        <Alert severity="info" sx={{ mt: 2 }}>
          End of category — no more questions.
        </Alert>
      )}
    </Container>
  );
}
