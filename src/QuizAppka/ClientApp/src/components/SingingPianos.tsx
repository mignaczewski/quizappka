import { Box, Button, Typography } from '@mui/material';
import type { SingingPianosQuestion as SingingPianosQuestionType, RevealedBox } from '../types/quiz';

interface Props {
  question: SingingPianosQuestionType;
  revealedBoxes?: RevealedBox[] | null;
  onBoxReveal?: (id: string) => void;
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
          const isRevealed = revealedBoxes?.find((r) => r.id === box.id)?.revealed === true;
          return (
            <Button
              key={box.id}
              variant={isRevealed ? 'contained' : 'outlined'}
              onClick={() => !isRevealed && onBoxReveal?.(box.id)}
              disabled={isRevealed}
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
