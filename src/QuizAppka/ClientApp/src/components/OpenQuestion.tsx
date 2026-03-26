import { Typography } from '@mui/material';
import type { OpenQuestion as OpenQuestionType } from '../types/quiz';

interface Props {
  question: OpenQuestionType;
}

export default function OpenQuestion({ question }: Props) {
  return (
    <Typography variant="h6">{question.prompt}</Typography>
  );
}
