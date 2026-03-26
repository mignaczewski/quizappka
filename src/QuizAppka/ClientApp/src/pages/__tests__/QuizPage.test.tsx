import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuizPage from '../QuizPage';
import * as quizApi from '../../services/quizApi';
import type { CategoryDetail } from '../../types/quiz';

vi.mock('../../services/quizApi');

const mockFetchCategory = vi.mocked(quizApi.fetchCategory);

const sampleCategory: CategoryDetail = {
  id: 'cat1',
  name: 'Test Category',
  questions: [
    { id: 'q1', type: 'open', prompt: 'First question?' },
    { id: 'q2', type: 'open', prompt: 'Second question?' },
    { id: 'q3', type: 'open', prompt: 'Third question?' },
  ],
};

function renderQuizPage(categoryId = 'cat1') {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${categoryId}`]}>
      <Routes>
        <Route path="/quiz/:categoryId" element={<QuizPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuizPage navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCategory.mockResolvedValue(sampleCategory);
  });

  it('shows first question initially', async () => {
    renderQuizPage();
    await waitFor(() => expect(screen.getByText('First question?')).toBeInTheDocument());
  });

  it('question order matches source array', async () => {
    renderQuizPage();
    await waitFor(() => expect(screen.getByText('First question?')).toBeInTheDocument());
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  it('next button advances question index', async () => {
    const user = userEvent.setup();
    renderQuizPage();
    await waitFor(() => expect(screen.getByText('First question?')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Second question?')).toBeInTheDocument();
    expect(screen.getByText(/Question 2 of 3/i)).toBeInTheDocument();
  });

  it('previous button reverses question index', async () => {
    const user = userEvent.setup();
    renderQuizPage();
    await waitFor(() => expect(screen.getByText('First question?')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByText('First question?')).toBeInTheDocument();
  });

  it('shows end-of-category alert at last question', async () => {
    const user = userEvent.setup();
    renderQuizPage();
    await waitFor(() => expect(screen.getByText('First question?')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    // At last question, Next should be disabled and end-of-category shown
    expect(screen.getByText(/end of category/i)).toBeInTheDocument();
  });
});
