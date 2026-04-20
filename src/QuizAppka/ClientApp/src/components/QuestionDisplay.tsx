import { Alert } from '@mui/material';
import type { Question, RevealState } from '../types/quiz';
import OpenQuestion from './OpenQuestion';
import ClosedQuestion from './ClosedQuestion';
import ImageRebusQuestionComponent from './ImageRebusQuestion';
import MemeQuestion from './MemeQuestion';
import SingingPianos from './SingingPianos';

interface Props {
  question: Question;
  revealState?: RevealState | null;
  onReveal?: () => void;
  onBoxReveal?: (index: number) => void;
}

export default function QuestionDisplay({ question, revealState, onReveal, onBoxReveal }: Props) {
  switch (question.type) {
    case 'open':
      return <OpenQuestion question={question} />;
    case 'closed':
      return <ClosedQuestion question={question} />;
    case 'image-rebus':
      return <ImageRebusQuestionComponent question={question} />;
    case 'meme':
      return (
        <MemeQuestion
          question={question}
          revealImage={revealState?.memeImageRevealed}
          onReveal={onReveal}
        />
      );
    case 'singing-pianos':
      return (
        <SingingPianos
          question={question}
          revealedBoxes={revealState?.singingPianosBoxesRevealed}
          onBoxReveal={onBoxReveal}
        />
      );
    default:
      return (
        <Alert severity="error" role="alert">
          Unsupported question type.
        </Alert>
      );
  }
}

