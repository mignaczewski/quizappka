import { Link, Typography } from '@mui/material';
import type { OpenQuestion as OpenQuestionType, DisplayMode } from '../types/quiz';

interface Props {
  question: OpenQuestionType;
  displayMode?: DisplayMode;
}

function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

export default function OpenQuestion({ question, displayMode }: Props) {
  const isMirror = displayMode === 'mirror';
  return (
    <>
      <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
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
