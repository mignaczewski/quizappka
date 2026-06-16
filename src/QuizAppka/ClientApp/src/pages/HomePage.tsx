import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CategoryList from "../components/CategoryList";
import { fetchCategories } from "../services/quizApi";
import { usePresenterSession } from "../hooks/usePresenterSession";
import type { CategorySummary } from "../types/quiz";

export default function HomePage() {
  usePresenterSession({ screen: "category-list" });
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
        setError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
        setLoading(false);
      });
  }, []);


  return (
    <Box
      data-testid="page-layout"
      sx={{ width: "100%", minHeight: "100vh", pt: 4 }}
    >
      <Grid container columns={12}>
        <Grid size={9} offset={1}>
          <Typography variant="h3" component="h1" gutterBottom>
            QUIZ
          </Typography>
        </Grid>
        <Grid size={2}>
          <Button
            variant="contained"
            href="/mirror"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2 }}
          >
            Mirroring
          </Button>
        </Grid>
      </Grid>
      <Grid container columns={12}>
        <Grid size={10} offset={1}>
          {!!categories && <CategoryList categories={categories} />}
          {error && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}
          {loading && <CircularProgress role="progressbar" />}
        </Grid>
      </Grid>
    </Box>
  );
}
