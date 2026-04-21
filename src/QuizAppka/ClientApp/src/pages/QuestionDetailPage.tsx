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
import type { CategoryDetail, Question, RevealState, SingingPianosQuestion } from "../types/quiz";
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

  const handleBack = () => {
    navigate(`/quiz/${categoryId}`);
  };

  const onBoxReveal = useCallback(
    (index: number) => {
      
      setRevealState(currentReveal => {
        const currentBoxes = currentReveal?.singingPianosBoxesRevealed ?? (question as SingingPianosQuestion)?.boxes.map(() => false) ?? [];
        const nextBoxes = [...currentBoxes];
        nextBoxes[index] = true;
        const nextReveal: RevealState = {
          ...revealState,
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
    [categoryId, questionId, revealState, question],
  );

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
          onReveal={() => {
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
          }}
          onBoxReveal={onBoxReveal}
        />
      )}
    </Container>
  );
}
