import { useCallback, useEffect, useRef, useState } from "react";
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
import type { CategoryDetail, Question, QuestionTimerState, RevealState } from "../types/quiz";
import QuestionDisplay from "../components/QuestionDisplay";

const TIMER_TICK_MS = 1000;

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
  const timerIntervalRef = useRef<number | null>(null);

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

  const publishRevealState = useCallback((nextReveal: RevealState) => {
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
  }, [categoryId, questionId]);

  const onReveal = useCallback(() => {
    const nextReveal: RevealState = {
      ...revealState,
      memeImageRevealed: true,
    };
    setRevealState(nextReveal);

    publishRevealState(nextReveal);
  }, [revealState, publishRevealState]);

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

        publishRevealState(nextReveal);

        return nextReveal;
      });
    },
    [publishRevealState],
  );

  const onStartTimer = useCallback(() => {
    if (!question || question.type !== "timed-open") {
      return;
    }

    setRevealState((currentReveal) => {
      const currentTimer = currentReveal?.timerState;
      const isAlreadyRunning = currentTimer?.status === "running";
      const isEnded = currentTimer?.status === "ended";
      if (isAlreadyRunning) {
        return currentReveal;
      }
      if (isEnded) {
        return currentReveal;
      }

      const nextTimerState: QuestionTimerState = {
        status: "running",
        initialDurationSeconds: currentTimer?.initialDurationSeconds ?? question.initialDurationSeconds,
        remainingSeconds: currentTimer?.remainingSeconds ?? question.initialDurationSeconds,
        lastUpdatedAtUtc: new Date().toISOString(),
      };

      const nextReveal: RevealState = {
        ...currentReveal,
        timerState: nextTimerState,
      };

      publishRevealState(nextReveal);
      return nextReveal;
    });
  }, [question, publishRevealState]);

  const onPauseTimer = useCallback(() => {
    if (!question || question.type !== "timed-open") {
      return;
    }

    setRevealState((currentReveal) => {
      const currentTimer = currentReveal?.timerState;
      if (!currentTimer || currentTimer.status !== "running") {
        return currentReveal;
      }

      const nextTimerState: QuestionTimerState = {
        ...currentTimer,
        status: "paused",
        lastUpdatedAtUtc: new Date().toISOString(),
      };
      const nextReveal: RevealState = {
        ...currentReveal,
        timerState: nextTimerState,
      };
      publishRevealState(nextReveal);
      return nextReveal;
    });
  }, [question, publishRevealState]);

  const onResetTimer = useCallback(() => {
    if (!question || question.type !== "timed-open") {
      return;
    }

    setRevealState((currentReveal) => {
      const initialDurationSeconds =
        currentReveal?.timerState?.initialDurationSeconds ?? question.initialDurationSeconds;

      const nextTimerState: QuestionTimerState = {
        status: "idle",
        initialDurationSeconds,
        remainingSeconds: initialDurationSeconds,
        lastUpdatedAtUtc: new Date().toISOString(),
      };
      const nextReveal: RevealState = {
        ...currentReveal,
        timerState: nextTimerState,
      };
      publishRevealState(nextReveal);
      return nextReveal;
    });
  }, [question, publishRevealState]);

  useEffect(() => {
    const timerState = revealState?.timerState;
    const shouldRunTimer = question?.type === "timed-open" && timerState?.status === "running";

    if (!shouldRunTimer) {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRevealState((currentReveal) => {
        const currentTimer = currentReveal?.timerState;
        if (!currentTimer || currentTimer.status !== "running") {
          return currentReveal;
        }

        const nextRemaining = Math.max(0, currentTimer.remainingSeconds - 1);
        const nextTimerState: QuestionTimerState = {
          ...currentTimer,
          remainingSeconds: nextRemaining,
          status: nextRemaining === 0 ? "ended" : "running",
          lastUpdatedAtUtc: new Date().toISOString(),
        };

        const nextReveal: RevealState = {
          ...currentReveal,
          timerState: nextTimerState,
        };

        publishRevealState(nextReveal);
        return nextReveal;
      });
    }, TIMER_TICK_MS);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [revealState?.timerState?.status, question, publishRevealState]);

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
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onResetTimer={onResetTimer}
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
