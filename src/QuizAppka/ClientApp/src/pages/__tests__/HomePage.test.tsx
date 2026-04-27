import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import * as quizApi from '../../services/quizApi';

vi.mock('../../services/quizApi');
vi.mock('../../hooks/usePresenterSession');

const mockFetchCategories = vi.mocked(quizApi.fetchCategories);

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching', async () => {
    mockFetchCategories.mockReturnValue(new Promise(() => {}));
    renderHomePage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('fetches and displays categories on mount', async () => {
    mockFetchCategories.mockResolvedValue([{ id: 'c1', name: 'Science' }]);
    renderHomePage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
  });

  it('shows error message on fetch failure', async () => {
    mockFetchCategories.mockRejectedValue(new Error('Network error'));
    renderHomePage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('wraps content in Grid layout (no Container root)', async () => {
    mockFetchCategories.mockResolvedValue([{ id: 'c1', name: 'Science' }]);
    const { container } = renderHomePage();
    await waitFor(() => expect(screen.getByText('Science')).toBeInTheDocument());
    expect(container.querySelector('.MuiContainer-root')).toBeNull();
  });
});
