import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuestionDetailPage from '../QuestionDetailPage';
import * as quizApi from '../../services/quizApi';
import type { CategoryDetail } from '../../types/quiz';

vi.mock('../../services/quizApi');

const mockCategory: CategoryDetail = {
  id: 'science',
  name: 'Science',
  questions: [
    { id: 'q1', type: 'open', prompt: 'What is gravity?' },
    {
      id: 'q2',
      type: 'closed',
      prompt: 'Atomic number of Carbon?',
      options: [
        { id: 'a', text: 'Option Six' },
        { id: 'b', text: 'Option Twelve' },
      ],
    },
    { id: 'q3', type: 'image-rebus', prompt: 'Name this element', imageRef: 'carbon.png' },
  ],
};

function renderPage(categoryId = 'science', questionId = 'q1') {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${categoryId}/${questionId}`]}>
      <Routes>
        <Route path="/quiz/:categoryId" element={<div data-testid="question-list">Question List</div>} />
        <Route path="/quiz/:categoryId/:questionId" element={<QuestionDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuestionDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading indicator while fetching', () => {
    vi.mocked(quizApi.fetchCategory).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders open question — shows prompt only, no answer options', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => expect(screen.getByText('What is gravity?')).toBeInTheDocument());
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders closed question — shows prompt and all answer options', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q2');
    await waitFor(() => expect(screen.getByText('Atomic number of Carbon?')).toBeInTheDocument());
    expect(screen.getByText('Option Six')).toBeInTheDocument();
    expect(screen.getByText('Option Twelve')).toBeInTheDocument();
  });

  it('renders image rebus question — shows image and prompt', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q3');
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument());
    expect(screen.getByText('Name this element')).toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    vi.mocked(quizApi.fetchCategory).mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('shows error alert when question id is not found in category', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'nonexistent');
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('shows the category name as heading', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
  });

  // US3 tests — back button (added here as the component grows to include it)
  it('renders a back button', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument());
  });

  it('navigates to the question list when back button is clicked', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => screen.getByRole('button', { name: /back/i }));
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByTestId('question-list')).toBeInTheDocument();
  });
});
