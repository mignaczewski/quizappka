import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { fetchPresenterCategory } from "../services/quizApi";
import { usePresenterSession } from "../hooks/usePresenterSession";
import { getPresenterHubConnection } from "../services/presenterHub";
import type { CategoryDetail, Question, RevealState } from "../types/quiz";
import QuestionDisplay from "../components/QuestionDisplay";

export default function QuestionDetailPage() {
  const { categoryId, questionId } = useParams<{
    categoryId: string;
    questionId: string;
  }>();
  usePresenterSession({
    screen: "question-detail",
    categoryId: categoryId ?? "",
    questionId: questionId ?? "",
  });
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealState, setRevealState] = useState<RevealState | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetchPresenterCategory(categoryId)
      .then((data) => {
        setCategory(data);
        const found = data.questions.find((q) => q.id === questionId) ?? null;
        setQuestion(found);
        if (!found) {
          setError(`Question not found: ${questionId}`);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load category",
        );
        setLoading(false);
      });
  }, [categoryId, questionId]);

  const onReveal = useCallback(() => {
    const nextReveal: RevealState = {
      ...revealState,
      memeImageRevealed: true,
    };
    setRevealState(nextReveal);

    getPresenterHubConnection()
      .invoke("UpdateState", {
        screen: "question-detail",
        categoryId,
        questionId,
        revealState: nextReveal,
      })
      .catch(() => {
        /* hub not connected */
      });
  }, [revealState, categoryId, questionId]);

  const handleBack = useCallback(() => {
    navigate(`/quiz/${categoryId}`);
  }, [categoryId, navigate]);

  const onBoxReveal = useCallback(
    (boxId: string) => {
      setRevealState((currentReveal) => {
        const currentBoxes = currentReveal?.singingPianosBoxesRevealed ?? [];
        const alreadyRevealed =
          currentBoxes.find((r) => r.id === boxId)?.revealed === true;
        if (alreadyRevealed) return currentReveal;

        const nextBoxes = currentBoxes.some((r) => r.id === boxId)
          ? currentBoxes.map((r) =>
              r.id === boxId ? { ...r, revealed: true } : r,
            )
          : [...currentBoxes, { id: boxId, revealed: true }];

        const nextReveal: RevealState = {
          ...currentReveal,
          singingPianosBoxesRevealed: nextBoxes,
        };

        getPresenterHubConnection()
          .invoke("UpdateState", {
            screen: "question-detail",
            categoryId,
            questionId,
            revealState: nextReveal,
          })
          .catch(() => {
            /* hub not connected */
          });

        return nextReveal;
      });
    },
    [categoryId, questionId],
  );

  return (
    <Box data-testid="page-layout" sx={{ width: "100%", pt: 4 }}>
      <Grid container columns={12}>
        <Grid size={7} offset={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            {category?.name}
          </Typography>
        </Grid>
        <Grid size={4}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              onClick={() => navigate("/")}
              sx={{ mb: 1 }}
              aria-label="Back to categories"
            >
              ← Powrót do listy kategorii
            </Button>
            <Button
              variant="text"
              onClick={handleBack}
              sx={{ mb: 2 }}
              aria-label="Back to questions"
            >
              ← Powrót do listy pytań
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Grid container columns={12}>
        <Grid size={10} offset={1}>
          {!!category && (
            <>
              {question && (
                <QuestionDisplay
                  question={question}
                  revealState={revealState}
                  onReveal={onReveal}
                  onBoxReveal={onBoxReveal}
                />
              )}
            </>
          )}
          {(error || !category) && (
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
