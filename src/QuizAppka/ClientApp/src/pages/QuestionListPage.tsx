import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { fetchCategory } from "../services/quizApi";
import { usePresenterSession } from "../hooks/usePresenterSession";
import type { CategoryDetail } from "../types/quiz";
import QuestionList from "../components/QuestionList";

export default function QuestionListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  usePresenterSession({
    screen: "question-list",
    categoryId: categoryId ?? "",
  });
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
        setError(
          err instanceof Error ? err.message : "Failed to load category",
        );
        setLoading(false);
      });
  }, [categoryId]);

  const handleSelectQuestion = (questionId: string) => {
    navigate(`/quiz/${categoryId}/${questionId}`);
  };

  return (
    <Box
      data-testid="page-layout"
      sx={{ width: "100%", pt: 4 }}
    >
      <Grid container columns={12}>
        <Grid size={8} offset={1}>
          <Typography variant="h3" component="h1" gutterBottom>
            {category?.name}
          </Typography>
        </Grid>
        <Grid size={3}>
          <Button
            variant="text"
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
            aria-label="Back to categories"
          >
            ← Powrót do listy kategorii
          </Button>
        </Grid>
      </Grid>
      <Grid container columns={12}>
        <Grid size={10} offset={1}>
          {!!category && (
            <QuestionList
              questions={category.questions}
              onSelectQuestion={handleSelectQuestion}
            />
          )}
          {(error || !category) && !loading && (
            <Alert severity="error" role="alert">
              {error ?? "Category not found"}
            </Alert>
          )}
          {loading && <CircularProgress role="progressbar" />}
        </Grid>
      </Grid>
    </Box>
  );
}
