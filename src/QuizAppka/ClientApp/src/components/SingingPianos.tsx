import Grid from '@mui/material/Grid';
import { Box, Button, Typography } from '@mui/material';
import type { SingingPianosQuestion as SingingPianosQuestionType, DisplayMode } from '../types/quiz';

interface Props {
  question: SingingPianosQuestionType;
  revealedBoxes?: boolean[] | null;
  onBoxReveal?: (index: number) => void;
  displayMode?: DisplayMode;
}

export default function SingingPianos({ question, revealedBoxes, onBoxReveal, displayMode }: Props) {
  const isMirror = displayMode === 'mirror';
  return (
    <>
      <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container columns={4} spacing={2}>
          {question.boxes.map((box, index) => {
            const isRevealed = revealedBoxes?.[index] === true;
            return (
              <Grid size={1} key={box.id}>
                <Button
                  fullWidth
                  variant={isRevealed ? 'contained' : 'outlined'}
                  onClick={() => !isRevealed && onBoxReveal?.(index)}
                  disabled={isRevealed && !onBoxReveal}
                  data-testid={`piano-box-${index}`}
                  sx={{
                    minHeight: isMirror ? 140 : 100,
                    fontSize: isMirror ? '2rem' : '1.5rem',
                  }}
                >
                  {isRevealed ? box.hiddenText : '?'}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
}
