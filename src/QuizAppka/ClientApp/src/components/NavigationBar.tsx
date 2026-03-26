import { Box, Button } from '@mui/material';

interface NavigationBarProps {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function NavigationBar({ index, total, onPrevious, onNext }: NavigationBarProps) {
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Button
        variant="outlined"
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Previous"
      >
        Previous
      </Button>
      <Button
        variant="contained"
        onClick={onNext}
        disabled={isLast}
        aria-label="Next"
      >
        Next
      </Button>
    </Box>
  );
}
