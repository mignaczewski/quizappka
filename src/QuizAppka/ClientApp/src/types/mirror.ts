export type PresenterScreen =
  | { screen: 'idle' }
  | { screen: 'category-list' }
  | { screen: 'question-list'; categoryId: string }
  | { screen: 'question-detail'; categoryId: string; questionId: string };
