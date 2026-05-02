import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { fetchPresenterCategory } from "../services/quizApi";
import { usePresenterSession } from "../hooks/usePresenterSession";
import { getPresenterHubConnection } from "../services/presenterHub";
import type { CategoryDetail, Question, RevealState, RevealedBox, SingingPianosQuestion } from "../types/quiz";
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
    if (!categoryId) {
      setError("Missing category ID");
      setLoading(false);
      return;
    }
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

  // T012 — dedicated effect broadcasts revealState to hub (not inside state updater)
  useEffect(() => {
    if (!revealState || !categoryId || !questionId) return;
    getPresenterHubConnection()
      .invoke("UpdateState", {
        screen: "question-detail",
        categoryId,
        questionId,
        revealState,
      })
      .catch(() => {
        /* hub not connected */
      });
  }, [revealState, categoryId, questionId]);

  const handleBack = useCallback(() => {
    navigate(`/quiz/${categoryId}`);
  }, [navigate, categoryId]);

  // T011 — fix stale closure: use currentReveal from updater arg, not captured revealState
  const onBoxReveal = useCallback(
    (id: string) => {
      setRevealState((currentReveal) => {
        const pianoQuestion = question as SingingPianosQuestion | null;
        const currentBoxes: RevealedBox[] =
          currentReveal?.singingPianosBoxesRevealed ??
          (pianoQuestion?.boxes.map((b) => ({ id: b.id, revealed: false })) ?? []);
        const nextBoxes = currentBoxes.map((b) =>
          b.id === id ? { ...b, revealed: true } : b,
        );
        return {
          ...currentReveal,
          singingPianosBoxesRevealed: nextBoxes,
        };
      });
    },
    [question],
  );

  // T013 — fix onReveal to use functional updater (no stale closure)
  const onReveal = useCallback(() => {
    setRevealState((current) => ({
      ...current,
      memeImageRevealed: true,
    }));
  }, []);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress role="progressbar" />
      </Container>
    );
  }

  if (error || !category) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            onClick={() => navigate("/")}
            sx={{ mb: 1 }}
            aria-label="Back to categories"
          >
            ← Back to categories
          </Button>
          <Button
            variant="text"
            onClick={handleBack}
            sx={{ mb: 2 }}
            aria-label="Back to questions"
          >
            ← Back to questions
          </Button>
        </Stack>
        <Alert severity="error" role="alert">
          {error ?? "Category not found"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack direction="row" spacing={2}>
        <Button
          variant="text"
          onClick={() => navigate("/")}
          sx={{ mb: 1 }}
          aria-label="Back to categories"
        >
          ← Back to categories
        </Button>
        <Button
          variant="text"
          onClick={handleBack}
          sx={{ mb: 2 }}
          aria-label="Back to questions"
        >
          ← Back to questions
        </Button>
      </Stack>
      <Typography variant="h4" gutterBottom>
        {category.name}
      </Typography>
      {question && (
        <QuestionDisplay
          question={question}
          revealState={revealState}
          onReveal={onReveal}
          onBoxReveal={onBoxReveal}
        />
      )}
    </Container>
  );
}
