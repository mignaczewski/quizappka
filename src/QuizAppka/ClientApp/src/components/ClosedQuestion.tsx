import { Link, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { ClosedQuestion as ClosedQuestionType } from '../types/quiz';
import { isUrl } from '../utils/url';

interface Props {
  question: ClosedQuestionType;
}

export default function ClosedQuestion({ question }: Props) {
  return (
    <>
      <Typography variant="h6">{question.prompt}</Typography>
      <List>
        {question.options.map((option) => (
          <ListItem key={option.id}>
            <ListItemText primary={option.text} />
          </ListItem>
        ))}
      </List>
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
