import type { RevealState } from './quiz';

export type PresenterScreen =
  | { screen: 'idle' }
  | { screen: 'category-list' }
  | { screen: 'question-list'; categoryId: string }
  | { screen: 'question-detail'; categoryId: string; questionId: string };

export interface StateUpdatedPayload {
  screen: string;
  categoryId?: string;
  questionId?: string;
  revealState?: RevealState | null;
}
