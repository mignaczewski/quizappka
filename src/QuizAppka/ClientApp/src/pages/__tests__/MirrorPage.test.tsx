import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MirrorPage from '../MirrorPage';

type StateUpdatedPayloadTest = {
  screen: string;
  categoryId?: string | null;
  questionId?: string | null;
  revealState?: {
    timerState?: {
      status: 'idle' | 'running' | 'paused' | 'ended';
      initialDurationSeconds: number;
      remainingSeconds: number;
      lastUpdatedAtUtc?: string | null;
    };
  };
};

type StateUpdatedCallback = (payload: StateUpdatedPayloadTest) => void;

const mockOn = vi.fn();
const mockOff = vi.fn();
const mockStart = vi.fn(() => Promise.resolve());
let onStateUpdated: StateUpdatedCallback | null = null;

vi.mock('../../services/presenterHub', () => ({
  getPresenterHubConnection: () => ({
    on: (event: string, cb: StateUpdatedCallback) => {
      if (event === 'StateUpdated') onStateUpdated = cb;
      mockOn(event, cb);
    },
    off: mockOff,
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
  }),
  startPresenterHub: () => mockStart(),
}));

vi.mock('../../services/quizApi', () => ({
  fetchCategories: vi.fn(() =>
    Promise.resolve([{ id: 'cat1', name: 'Science' }]),
  ),
  fetchCategory: vi.fn(() =>
    Promise.resolve({
      id: 'cat1',
      name: 'Science',
      questions: [
        { id: 'q1', type: 'open', prompt: 'What is 2+2?' },
        { id: 'q2', type: 'timed-open', prompt: 'Name two gases.', initialDurationSeconds: 45 },
      ],
    }),
  ),
}));

function renderMirrorPage() {
  return render(
    <MemoryRouter>
      <MirrorPage />
    </MemoryRouter>
  );
}

describe('MirrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStart.mockImplementation(() => Promise.resolve());
    onStateUpdated = null;
  });

  it('shows connecting spinner before hub connects', () => {
    mockStart.mockReturnValue(new Promise(() => {}));
    renderMirrorPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows idle message when connected and no state received', async () => {
    renderMirrorPage();
    await waitFor(() =>
      expect(screen.getByRole('status')).toBeInTheDocument(),
    );
    expect(screen.getByText(/waiting for presenter/i)).toBeInTheDocument();
  });

  it('shows category list screen when StateUpdated with category-list', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({ screen: 'category-list' });
    });

    await waitFor(() =>
      expect(screen.getByText('QUIZ')).toBeInTheDocument(),
    );
  });

  it('shows question list when StateUpdated with question-list', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({ screen: 'question-list', categoryId: 'cat1' });
    });

    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
  });

  it('shows question detail when StateUpdated with question-detail', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({ screen: 'question-detail', categoryId: 'cat1', questionId: 'q1' });
    });

    await waitFor(() => expect(screen.getByText(/2\+2/)).toBeInTheDocument());
  });

  it('renders timed-open timer value from StateUpdated revealState', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({
        screen: 'question-detail',
        categoryId: 'cat1',
        questionId: 'q2',
        revealState: {
          timerState: {
            status: 'running',
            initialDurationSeconds: 45,
            remainingSeconds: 33,
            lastUpdatedAtUtc: '2026-06-20T10:00:00Z',
          },
        },
      });
    });

    await waitFor(() => expect(screen.getByText('Name two gases.')).toBeInTheDocument());
    expect(screen.getByTestId('timed-open-timer')).toHaveTextContent('00:33');
    expect(screen.getByTestId('timed-open-status')).toHaveTextContent('running');
  });

  it('renders paused timer state from StateUpdated revealState', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({
        screen: 'question-detail',
        categoryId: 'cat1',
        questionId: 'q2',
        revealState: {
          timerState: {
            status: 'paused',
            initialDurationSeconds: 45,
            remainingSeconds: 20,
            lastUpdatedAtUtc: '2026-06-20T10:00:00Z',
          },
        },
      });
    });

    await waitFor(() => expect(screen.getByText('Name two gases.')).toBeInTheDocument());
    expect(screen.getByTestId('timed-open-timer')).toHaveTextContent('00:20');
    expect(screen.getByTestId('timed-open-status')).toHaveTextContent('paused');
  });

  it('renders reset idle timer state from StateUpdated revealState', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({
        screen: 'question-detail',
        categoryId: 'cat1',
        questionId: 'q2',
        revealState: {
          timerState: {
            status: 'idle',
            initialDurationSeconds: 45,
            remainingSeconds: 45,
            lastUpdatedAtUtc: '2026-06-20T10:00:00Z',
          },
        },
      });
    });

    await waitFor(() => expect(screen.getByText('Name two gases.')).toBeInTheDocument());
    expect(screen.getByTestId('timed-open-timer')).toHaveTextContent('00:45');
    expect(screen.getByTestId('timed-open-status')).toHaveTextContent('idle');
  });

  it('renders question prompt as h2 heading in question-detail mode (displayMode mirror)', async () => {
    renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());

    act(() => {
      onStateUpdated?.({ screen: 'question-detail', categoryId: 'cat1', questionId: 'q1' });
    });

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/2\+2/),
    );
  });

  it('does not render a Container element as page root (uses Grid wrapper)', async () => {
    const { container } = renderMirrorPage();
    await waitFor(() => expect(mockStart).toHaveBeenCalled());
    expect(container.querySelector('.MuiContainer-root')).toBeNull();
  });
});
