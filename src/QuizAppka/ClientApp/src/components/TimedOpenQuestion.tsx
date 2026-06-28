import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type {
  DisplayMode,
  QuestionTimerState,
  TimedOpenQuestion as TimedOpenQuestionType,
} from "../types/quiz";
import { useEffect } from "react";

interface Props {
  question: TimedOpenQuestionType;
  timerState?: QuestionTimerState | null;
  displayMode?: DisplayMode;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
}

function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function TimedOpenQuestion({
  question,
  timerState,
  displayMode,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
}: Props) {
  const isMirror = displayMode === "mirror";
  const status = timerState?.status ?? "idle";
  const effectiveRemaining =
    timerState?.remainingSeconds ?? question.initialDurationSeconds;
  const timerLabel = formatSeconds(effectiveRemaining);
  const isRunning = status === "running";
  const isEnded = status === "ended";
  const isPaused = status === "paused";
  const isIdleAndInitial =
    status === "idle" && effectiveRemaining === question.initialDurationSeconds;

  useEffect(() => {
    console.log((question.initialDurationSeconds - effectiveRemaining)/question.initialDurationSeconds * 100);
  }, [effectiveRemaining, question.initialDurationSeconds]);

  return (
    <>
      <Typography variant={isMirror ? "h2" : "h4"}>
        {question.prompt}
      </Typography>
      <Stack direction="row" sx={{mt: 3}}>
        <Typography
          variant={isMirror ? "h2" : "h4"}
          data-testid="timed-open-timer"
          aria-live="polite"
        >
          {timerLabel}
        </Typography>
        <CircularProgress
          variant="determinate"
          value={(question.initialDurationSeconds - effectiveRemaining)/question.initialDurationSeconds * 100}
          aria-label="Loading"
        />
      </Stack>
      {!isMirror && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onStartTimer}
            disabled={isRunning || isEnded}
            data-testid="timed-open-start"
          >
            {isPaused ? "Resume" : "Start"}
          </Button>
          <Button
            variant="outlined"
            onClick={onPauseTimer}
            disabled={!isRunning}
            data-testid="timed-open-pause"
          >
            pauza
          </Button>
          <Button
            variant="text"
            onClick={onResetTimer}
            disabled={isIdleAndInitial}
            data-testid="timed-open-reset"
          >
            reset
          </Button>
        </Stack>
      )}
    </>
  );
}
