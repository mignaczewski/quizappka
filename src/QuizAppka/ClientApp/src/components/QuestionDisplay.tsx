import { Alert } from '@mui/material';
import type { Question } from '../types/quiz';
import OpenQuestion from './OpenQuestion';
import ClosedQuestion from './ClosedQuestion';
import ImageRebusQuestionComponent from './ImageRebusQuestion';

interface Props {
  question: Question;
}

export default function QuestionDisplay({ question }: Props) {
  switch (question.type) {
    case 'open':
      return <OpenQuestion question={question} />;
    case 'closed':
      return <ClosedQuestion question={question} />;
    case 'image-rebus':
      return <ImageRebusQuestionComponent question={question} />;
    default:
      return (
        <Alert severity="error" role="alert">
          Unsupported question type.
        </Alert>
      );
  }
}
