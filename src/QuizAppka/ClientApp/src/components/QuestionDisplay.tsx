import { Alert } from '@mui/material';
import type { Question, RevealState, DisplayMode } from '../types/quiz';
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
  displayMode?: DisplayMode;
}

export default function QuestionDisplay({ question, revealState, onReveal, onBoxReveal, displayMode }: Props) {
  switch (question.type) {
    case 'open':
      return <OpenQuestion question={question} displayMode={displayMode} />;
    case 'closed':
      return <ClosedQuestion question={question} displayMode={displayMode} />;
    case 'image-rebus':
      return <ImageRebusQuestionComponent question={question} displayMode={displayMode} />;
    case 'meme':
      return (
        <MemeQuestion
          question={question}
          revealImage={revealState?.memeImageRevealed}
          onReveal={onReveal}
          displayMode={displayMode}
        />
      );
    case 'singing-pianos':
      return (
        <SingingPianos
          question={question}
          revealedBoxes={revealState?.singingPianosBoxesRevealed}
          onBoxReveal={onBoxReveal}
          displayMode={displayMode}
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

