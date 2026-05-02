import { Link, Typography } from '@mui/material';
import type { OpenQuestion as OpenQuestionType } from '../types/quiz';
import { isUrl } from '../utils/url';

interface Props {
  question: OpenQuestionType;
}

export default function OpenQuestion({ question }: Props) {
  return (
    <>
      <Typography variant="h6">{question.prompt}</Typography>
      {question.presenterHint && (
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
