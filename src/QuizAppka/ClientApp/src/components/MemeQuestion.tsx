import { useState, useEffect } from 'react';
import { Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { MemeQuestion as MemeQuestionType } from '../types/quiz';

interface Props {
  question: MemeQuestionType;
  revealImage?: boolean | null;
  onReveal?: () => void;
}

export default function MemeQuestion({ question, revealImage, onReveal }: Props) {
  const [imgError, setImgError] = useState(false);

  const imageSrc = revealImage && question.revealImage
    ? `/images/${question.revealImage}`
    : `/images/${question.entryImage}`;

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  return (
    <>
      <Typography variant="h6">{question.prompt}</Typography>
      <Box sx={{ my: 2 }}>
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
            style={{ maxWidth: '100%', maxHeight: 400 }}
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
