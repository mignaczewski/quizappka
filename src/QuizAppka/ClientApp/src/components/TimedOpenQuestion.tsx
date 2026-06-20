import { Box, Button, Stack, Typography } from '@mui/material';
import type { DisplayMode, QuestionTimerState, TimedOpenQuestion as TimedOpenQuestionType } from '../types/quiz';

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
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
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
  const isMirror = displayMode === 'mirror';
  const status = timerState?.status ?? 'idle';
  const effectiveRemaining = timerState?.remainingSeconds ?? question.initialDurationSeconds;
  const timerLabel = formatSeconds(effectiveRemaining);
  const isRunning = status === 'running';
  const isEnded = status === 'ended';
  const isPaused = status === 'paused';
  const isIdleAndInitial = status === 'idle' && effectiveRemaining === question.initialDurationSeconds;

  return (
    <>
      <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant={isMirror ? 'h2' : 'h4'} data-testid="timed-open-timer" aria-live="polite">
          {timerLabel}
        </Typography>
        <Typography variant={isMirror ? 'h5' : 'body1'} data-testid="timed-open-status" sx={{ mt: 1 }}>
          {status}
        </Typography>
      </Box>
      {!isMirror && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onStartTimer}
            disabled={isRunning || isEnded}
            data-testid="timed-open-start"
          >
            {isPaused ? 'Resume' : 'Start'}
          </Button>
          <Button
            variant="outlined"
            onClick={onPauseTimer}
            disabled={!isRunning}
            data-testid="timed-open-pause"
          >
            Pause
          </Button>
          <Button
            variant="text"
            onClick={onResetTimer}
            disabled={isIdleAndInitial}
            data-testid="timed-open-reset"
          >
            Reset
          </Button>
        </Stack>
      )}
    </>
  );
}
