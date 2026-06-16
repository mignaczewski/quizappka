export interface AnswerOption {
  id: string;
  text: string;
}

export interface BaseQuestion {
  id: string;
  type: string;
  prompt: string;
  title?: string;
}

export interface OpenQuestion extends BaseQuestion {
  type: 'open';
  presenterHint?: string;
}

export interface ClosedQuestion extends BaseQuestion {
  type: 'closed';
  options: AnswerOption[];
  presenterHint?: string;
}

export interface ImageRebusQuestion extends BaseQuestion {
  type: 'image-rebus';
  imageRef: string;
}

export interface MemeQuestion extends BaseQuestion {
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
  presenterHint?: string;
}

export interface PianoBox {
  id: string;
  hiddenText: string;
}

export interface SingingPianosQuestion extends BaseQuestion {
  type: 'singing-pianos';
  boxes: PianoBox[];
  presenterHint?: string;
}

export interface PianoBoxReveal {
  id: string;
  revealed: boolean;
}

export interface RevealState {
  memeImageRevealed?: boolean | null;
  singingPianosBoxesRevealed?: PianoBoxReveal[] | null;
}

export type Question = OpenQuestion | ClosedQuestion | ImageRebusQuestion | MemeQuestion | SingingPianosQuestion;

export type DisplayMode = 'presenter' | 'mirror';

export interface CategorySummary {
  id: string;
  name: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  questions: Question[];
}
