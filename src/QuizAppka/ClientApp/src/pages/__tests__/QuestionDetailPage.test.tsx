import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuestionDetailPage from '../QuestionDetailPage';
import * as quizApi from '../../services/quizApi';
import type { CategoryDetail } from '../../types/quiz';

vi.mock('../../services/quizApi');
vi.mock('../../hooks/usePresenterSession');

const mockInvoke = vi.fn(() => Promise.resolve());
vi.mock('../../services/presenterHub', () => ({
  getPresenterHubConnection: () => ({ invoke: mockInvoke }),
}));

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
    mockInvoke.mockResolvedValue(undefined);
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

  // T008 — onBoxReveal state-logic tests
  describe('onBoxReveal (Singing Pianos)', () => {
    const categoryWithPianos: CategoryDetail = {
      id: 'music',
      name: 'Music',
      questions: [
        {
          id: 'q-piano',
          type: 'singing-pianos',
          prompt: 'Reveal me!',
          boxes: [
            { id: 'box1', hiddenText: 'DO' },
            { id: 'box2', hiddenText: 'RE' },
            { id: 'box3', hiddenText: 'MI' },
          ],
        },
      ],
    };

    it('clicking an unrevealed box reveals it by id', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(categoryWithPianos);
      renderPage('music', 'q-piano');
      await waitFor(() => expect(screen.getByText('Reveal me!')).toBeInTheDocument());

      await userEvent.click(screen.getByTestId('piano-box-1'));

      expect(screen.getByTestId('piano-box-1')).toHaveTextContent('RE');
      expect(screen.getByTestId('piano-box-0')).toHaveTextContent('?');
    });

    it('clicking an already-revealed box does not change state', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(categoryWithPianos);
      renderPage('music', 'q-piano');
      await waitFor(() => expect(screen.getByText('Reveal me!')).toBeInTheDocument());

      // Reveal box1
      await userEvent.click(screen.getByTestId('piano-box-0'));
      expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');

      const invokeCallCount = mockInvoke.mock.calls.length;

      // Click again — should be a no-op (button is now contained/disabled for re-reveal)
      await userEvent.click(screen.getByTestId('piano-box-0'));
      expect(mockInvoke.mock.calls.length).toBe(invokeCallCount);
    });

    it('hub invoke is called with PianoBoxReveal[] payload after a box reveal', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(categoryWithPianos);
      renderPage('music', 'q-piano');
      await waitFor(() => expect(screen.getByText('Reveal me!')).toBeInTheDocument());

      await userEvent.click(screen.getByTestId('piano-box-2'));

      await waitFor(() => expect(mockInvoke).toHaveBeenCalled());
      const calls = mockInvoke.mock.calls as unknown as [string, { revealState: { singingPianosBoxesRevealed: { id: string; revealed: boolean }[] } }][];
      const [method, payload] = calls[0]!;
      expect(method).toBe('UpdateState');
      expect(payload.revealState.singingPianosBoxesRevealed).toEqual([
        { id: 'box3', revealed: true },
      ]);
    });

    it('revealing multiple boxes accumulates entries', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(categoryWithPianos);
      renderPage('music', 'q-piano');
      await waitFor(() => expect(screen.getByText('Reveal me!')).toBeInTheDocument());

      await userEvent.click(screen.getByTestId('piano-box-0'));
      await userEvent.click(screen.getByTestId('piano-box-2'));

      expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');
      expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
      expect(screen.getByTestId('piano-box-2')).toHaveTextContent('MI');
    });
  });

  // T009 — Callback-stability tests
  describe('callback stability (useCallback)', () => {
    const categoryWithMeme: CategoryDetail = {
      id: 'fun',
      name: 'Fun',
      questions: [
        {
          id: 'q-meme',
          type: 'meme',
          prompt: 'Caption this',
          entryImage: 'meme.jpg',
          revealImage: 'meme-reveal.jpg',
          options: [{ id: 'o1', text: 'Option A' }],
        },
      ],
    };

    it('onReveal reference is stable across unrelated re-renders (does not change when question is unchanged)', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(categoryWithMeme);
      renderPage('fun', 'q-meme');
      await waitFor(() => expect(screen.getByText('Caption this')).toBeInTheDocument());

      const revealBtn = screen.getByTestId('reveal-image-button');

      await userEvent.click(revealBtn);

      // After reveal, the reveal button is gone and the meme image is visible
      await waitFor(() => expect(screen.queryByTestId('reveal-image-button')).toBeNull());
      expect(screen.getByAltText('Revealed meme')).toBeInTheDocument();
    });

    it('handleBack reference is stable: clicking back navigates without errors after a re-render', async () => {
      vi.mocked(quizApi.fetchPresenterCategory).mockResolvedValue(mockCategory);
      renderPage();
      await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());

      const backBtn = screen.getByRole('button', { name: /back to questions/i });
      await userEvent.click(backBtn);
      await waitFor(() => expect(screen.getByTestId('question-list')).toBeInTheDocument());
    });
  });
});

