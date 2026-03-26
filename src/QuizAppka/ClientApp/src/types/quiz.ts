export interface AnswerOption {
  id: string;
  text: string;
}

export interface BaseQuestion {
  id: string;
  type: string;
  prompt: string;
}

export interface OpenQuestion extends BaseQuestion {
  type: 'open';
}

export interface ClosedQuestion extends BaseQuestion {
  type: 'closed';
  options: AnswerOption[];
}

export interface ImageRebusQuestion extends BaseQuestion {
  type: 'image-rebus';
  imageRef: string;
}

export type Question = OpenQuestion | ClosedQuestion | ImageRebusQuestion;

export interface CategorySummary {
  id: string;
  name: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  questions: Question[];
}
