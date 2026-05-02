import { Chip, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { Question } from '../types/quiz';

interface QuestionListProps {
  questions: Question[];
  onSelectQuestion: (questionId: string) => void;
}

function typeLabel(question: Question): string {
  switch (question.type) {
    case 'open':
      return 'open';
    case 'closed':
      return 'closed';
    case 'image-rebus':
      return 'image rebus';
    case 'meme':
      return 'meme';
    case 'singing-pianos':
      return 'singing pianos';
    default:
      return 'unknown'; 
  }
}

export default function QuestionList({ questions, onSelectQuestion }: QuestionListProps) {
  return (
    <List disablePadding>
      {questions.map((question, index) => (
        <ListItemButton
          key={question.id}
          onClick={() => onSelectQuestion(question.id)}
          divider
          sx={{ gap: 1.5, py: 1.5 }}
        >
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 28, fontVariantNumeric: 'tabular-nums' }}
          >
            {index + 1}.
          </Typography>
          <Chip
            label={typeLabel(question)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 90 }}
          />
          {question.validationError && (
            <Chip label="Invalid" color="error" size="small" />
          )}
          <ListItemText
            primary={question.prompt}
            slotProps={{
              primary: {
                noWrap: true,
                sx: { overflow: 'hidden', textOverflow: 'ellipsis' },
              },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
