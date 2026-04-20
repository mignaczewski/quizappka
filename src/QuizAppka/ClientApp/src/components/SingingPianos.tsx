import { Box, Button, Typography } from '@mui/material';
import type { SingingPianosQuestion as SingingPianosQuestionType } from '../types/quiz';

interface Props {
  question: SingingPianosQuestionType;
  revealedBoxes?: boolean[] | null;
  onBoxReveal?: (index: number) => void;
}

export default function SingingPianos({ question, revealedBoxes, onBoxReveal }: Props) {
  return (
    <>
      <Typography variant="h6">{question.prompt}</Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mt: 2,
        }}
      >
        {question.boxes.map((box, index) => {
          const isRevealed = revealedBoxes?.[index] === true;
          return (
            <Button
              key={box.id}
              variant={isRevealed ? 'contained' : 'outlined'}
              onClick={() => !isRevealed && onBoxReveal?.(index)}
              disabled={isRevealed && !onBoxReveal}
              data-testid={`piano-box-${index}`}
              sx={{ minWidth: 80, minHeight: 80, fontSize: '1.25rem' }}
            >
              {isRevealed ? box.hiddenText : '?'}
            </Button>
          );
        })}
      </Box>
    </>
  );
}
