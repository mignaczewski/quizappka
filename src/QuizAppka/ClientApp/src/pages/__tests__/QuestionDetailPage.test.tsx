import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuestionDetailPage from '../QuestionDetailPage';
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
        <Route path="/" element={<div data-testid="category-list">Category List</div>} />
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
    vi.mocked(quizApi.fetchPresenterCategory).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders open question — shows prompt only, no answer options', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => expect(screen.getByText('What is gravity?')).toBeInTheDocument());
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders closed question — shows prompt and all answer options', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q2');
    await waitFor(() => expect(screen.getByText('Atomic number of Carbon?')).toBeInTheDocument());
    expect(screen.getByText('Option Six')).toBeInTheDocument();
    expect(screen.getByText('Option Twelve')).toBeInTheDocument();
  });

  it('renders image rebus question — shows image and prompt', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q3');
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument());
    expect(screen.getByText('Name this element')).toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('shows error alert when question id is not found in category', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'nonexistent');
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('shows the category name as heading', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
  });

  // US3 tests — back to questions button
  it('renders a back to questions button', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back to questions' })).toBeInTheDocument()
    );
  });

  it('navigates to the question list when back to questions button is clicked', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => screen.getByRole('button', { name: 'Back to questions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back to questions' }));
    expect(screen.getByTestId('question-list')).toBeInTheDocument();
  });

  // T004 — back to categories button is present
  it('renders a back to categories button', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back to categories' })).toBeInTheDocument()
    );
  });

  // T005 — back to categories button navigates to /
  it('navigates to category list when back to categories button is clicked', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => screen.getByRole('button', { name: 'Back to categories' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back to categories' }));
    expect(screen.getByTestId('category-list')).toBeInTheDocument();
  });

  // T006 — both back buttons are present simultaneously
  it('renders both back to categories and back to questions buttons together', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    renderPage('science', 'q1');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back to categories' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back to questions' })).toBeInTheDocument();
    });
  });

  it('wraps content in Grid layout (no Container root)', async () => {
    vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
    expect(container.querySelector('.MuiContainer-root')).toBeNull();
  });
});

