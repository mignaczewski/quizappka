import { List, ListItem, ListItemText, Typography } from '@mui/material';
import type { ClosedQuestion as ClosedQuestionType } from '../types/quiz';

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
    </>
  );
}
