import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { ImageRebusQuestion as ImageRebusQuestionType } from '../types/quiz';

interface Props {
  question: ImageRebusQuestionType;
}

export default function ImageRebusQuestion({ question }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
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
            style={{ maxWidth: '100%', maxHeight: 400 }}
          />
        )}
      </Box>
      {question.prompt && (
        <Typography variant="h6">{question.prompt}</Typography>
      )}
    </Box>
  );
}
