import { useEffect } from 'react';
import { getPresenterHubConnection, startPresenterHub } from '../services/presenterHub';
import type { PresenterScreen } from '../types/mirror';

export function usePresenterSession(state: PresenterScreen): void {
  const screen = state.screen;
  const categoryId = 'categoryId' in state ? state.categoryId : null;
  const questionId = 'questionId' in state ? state.questionId : null;

  useEffect(() => {
    const connection = getPresenterHubConnection();

    startPresenterHub()
      .then(() =>
        connection.invoke('UpdateState', {
          screen,
          categoryId,
          questionId,
        }),
      )
      .catch(() => {
        // silently ignore connection/invoke errors
      });
  }, [screen, categoryId, questionId]);
}
