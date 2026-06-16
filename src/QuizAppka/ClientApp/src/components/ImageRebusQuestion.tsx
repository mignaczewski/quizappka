import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { ImageRebusQuestion as ImageRebusQuestionType, DisplayMode } from '../types/quiz';

interface Props {
  question: ImageRebusQuestionType;
  displayMode?: DisplayMode;
}

export default function ImageRebusQuestion({ question, displayMode }: Props) {
  const [imgError, setImgError] = useState(false);
  const isMirror = displayMode === 'mirror';
  const maxHeight = isMirror ? '80vh' : '70vh';

  return (
    <Box>
      {question.prompt && (
        <Typography variant={isMirror ? 'h2' : 'h4'}>{question.prompt}</Typography>
      )}
      <Box
        sx={{
          width: '100%',
          maxHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
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
            src={`/images/${question.imageRef}`}
            alt={question.prompt}
            onError={() => setImgError(true)}
            style={{ maxWidth: '100%', maxHeight, objectFit: 'contain' }}
          />
        )}
      </Box>
      
    </Box>
  );
}
