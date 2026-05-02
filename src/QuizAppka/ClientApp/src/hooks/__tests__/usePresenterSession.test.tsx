import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { usePresenterSession } from '../usePresenterSession';

const mockInvoke = vi.fn(() => Promise.resolve());
const mockStart = vi.fn(() => Promise.resolve());

vi.mock('../../services/presenterHub', () => ({
  getPresenterHubConnection: () => ({
    invoke: mockInvoke,
  }),
  startPresenterHub: () => mockStart(),
}));

function TestComponent() {
  usePresenterSession({ screen: 'category-list' } as Parameters<typeof usePresenterSession>[0]);
  return null;
}

function TestWithCategoryId({ categoryId }: { categoryId: string }) {
  usePresenterSession({ screen: 'question-list', categoryId });
  return null;
}

function renderInRouter(element: React.ReactElement) {
  return render(<MemoryRouter><Routes><Route path="/" element={element} /></Routes></MemoryRouter>);
}

describe('usePresenterSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes UpdateState with category-list screen', async () => {
    await act(async () => {
      renderInRouter(<TestComponent />);
    });

    expect(mockInvoke).toHaveBeenCalledWith('UpdateState', expect.objectContaining({
      screen: 'category-list',
    }));
  });

  it('invokes UpdateState with question-list and categoryId', async () => {
    await act(async () => {
      renderInRouter(<TestWithCategoryId categoryId="cat1" />);
    });

    expect(mockInvoke).toHaveBeenCalledWith('UpdateState', expect.objectContaining({
      screen: 'question-list',
      categoryId: 'cat1',
    }));
  });

  it('invokes UpdateState again when categoryId changes', async () => {
    let rerender: ReturnType<typeof render>['rerender'];

    await act(async () => {
      const result = renderInRouter(<TestWithCategoryId categoryId="cat1" />);
      rerender = result.rerender;
    });

    await act(async () => {
      rerender(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<TestWithCategoryId categoryId="cat2" />} />
          </Routes>
        </MemoryRouter>,
      );
    });

    const calls = mockInvoke.mock.calls.map((c: unknown[]) => (c[1] as { categoryId: string }).categoryId);
    expect(calls).toContain('cat1');
    expect(calls).toContain('cat2');
  });

  // T022 — US3: empty categoryId must not trigger an UpdateState invoke
  it('does not invoke UpdateState when categoryId is an empty string', async () => {
    await act(async () => {
      renderInRouter(<TestWithCategoryId categoryId="" />);
    });

    const updateStateCalls = mockInvoke.mock.calls.filter((c: unknown[]) => c[0] === 'UpdateState');
    expect(updateStateCalls).toHaveLength(0);
  });

  it('invokes UpdateState for valid non-empty categoryId', async () => {
    await act(async () => {
      renderInRouter(<TestWithCategoryId categoryId="science" />);
    });

    expect(mockInvoke).toHaveBeenCalledWith('UpdateState', expect.objectContaining({
      categoryId: 'science',
    }));
  });
});
