import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuestionListPage from '../QuestionListPage';
import * as quizApi from '../../services/quizApi';
import type { CategoryDetail } from '../../types/quiz';

vi.mock('../../services/quizApi');
vi.mock('../../hooks/usePresenterSession');

const mockCategory: CategoryDetail = {
  id: 'science',
  name: 'Science',
  questions: [
    { id: 'q1', type: 'open', prompt: 'What is gravity?' },
    {
      id: 'q2',
      type: 'closed',
      prompt: 'Atomic number of Carbon?',
      options: [{ id: 'a', text: '6' }, { id: 'b', text: '12' }],
    },
    { id: 'q3', type: 'image-rebus', prompt: 'Name the element', imageRef: 'carbon.png' },
  ],
};

function renderPage(categoryId = 'science') {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${categoryId}`]}>
      <Routes>
        <Route path="/" element={<div data-testid="category-list">Category List</div>} />
        <Route path="/quiz/:categoryId" element={<QuestionListPage />} />
        <Route path="/quiz/:categoryId/:questionId" element={<div>Question Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuestionListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading indicator while fetching', () => {
    vi.mocked(quizApi.fetchCategory).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders all questions from the category as list entries', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    // 3 question buttons + 1 "Back to categories" button = 4 total
    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(4));
    expect(screen.getByText(/What is gravity/)).toBeInTheDocument();
    expect(screen.getByText(/Atomic number of Carbon/)).toBeInTheDocument();
    expect(screen.getByText(/Name the element/)).toBeInTheDocument();
  });

  it('shows the category name as heading', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
  });

  it('does not auto-open any question detail', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => screen.getAllByRole('button'));
    expect(screen.queryByText('Question Detail')).not.toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    vi.mocked(quizApi.fetchCategory).mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('shows error alert when category is not found (404)', async () => {
    vi.mocked(quizApi.fetchCategory).mockRejectedValue(new Error('Category not found: unknown'));
    renderPage('unknown');
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('shows all question types without filtering', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('open')).toBeInTheDocument();
      expect(screen.getByText('closed')).toBeInTheDocument();
      expect(screen.getByText('image rebus')).toBeInTheDocument();
    });
  });

  // T001 — back to categories button is present
  it('renders a back to categories button', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back to categories' })).toBeInTheDocument()
    );
  });

  // T002 — back to categories button navigates to /
  it('navigates to category list when back to categories button is clicked', async () => {
    vi.mocked(quizApi.fetchCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: 'Back to categories' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back to categories' }));
    expect(screen.getByTestId('category-list')).toBeInTheDocument();
  });
});
