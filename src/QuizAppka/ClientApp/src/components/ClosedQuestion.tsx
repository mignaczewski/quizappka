import { Link, Paper, Stack, Typography } from '@mui/material';
import type { ClosedQuestion as ClosedQuestionType, DisplayMode } from '../types/quiz';

interface Props {
  question: ClosedQuestionType;
  displayMode?: DisplayMode;
}

function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

export default function ClosedQuestion({ question, displayMode }: Props) {
  const isMirror = displayMode === 'mirror';
  return (
    <>
      <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {question.options.map((option) => (
          <Paper key={option.id} elevation={1} sx={{ px: 3, py: 2 }} data-testid="answer-option">
            <Typography variant={isMirror ? 'h4' : 'h5'}>{option.text}</Typography>
          </Paper>
        ))}
      </Stack>
      {!isMirror && question.presenterHint && (
        <Typography variant="body2" color="text.secondary" data-testid="presenter-hint" sx={{ mt: 1 }}>
          {isUrl(question.presenterHint) ? (
            <Link href={question.presenterHint} target="_blank" rel="noopener noreferrer">
              {question.presenterHint}
            </Link>
          ) : (
            question.presenterHint
          )}
        </Typography>
      )}
    </>
  );
}
