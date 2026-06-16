import { useState, useEffect } from 'react';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import type { MemeQuestion as MemeQuestionType, DisplayMode } from '../types/quiz';

interface Props {
  question: MemeQuestionType;
  revealImage?: boolean | null;
  onReveal?: () => void;
  displayMode?: DisplayMode;
}

function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

export default function MemeQuestion({ question, revealImage, onReveal, displayMode }: Props) {
  const [imgError, setImgError] = useState(false);
  const isMirror = displayMode === 'mirror';
  const maxHeight = isMirror ? '80vh' : '70vh';

  const imageSrc = revealImage && question.revealImage
    ? `/images/${question.revealImage}`
    : `/images/${question.entryImage}`;

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  return (
    <>
      <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
      <Box
        sx={{
          width: '100%',
          maxHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: 2,
        }}
      >
        {imgError ? (
          <Box
            sx={{
              width: 300,
              height: 200,
              bgcolor: 'action.disabledBackground',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary" variant="body2">
              Image unavailable
            </Typography>
          </Box>
        ) : (
          <img
            src={imageSrc}
            alt={revealImage && question.revealImage ? 'Revealed meme' : question.prompt}
            data-testid="meme-image"
            onError={() => setImgError(true)}
            style={{ maxWidth: '100%', maxHeight, objectFit: 'contain' }}
          />
        )}
      </Box>
      {question.revealImage && !revealImage && onReveal && (
        <Button
          variant="contained"
          onClick={onReveal}
          data-testid="reveal-image-button"
          sx={{ mb: 2 }}
        >
          Reveal Image
        </Button>
      )}
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
