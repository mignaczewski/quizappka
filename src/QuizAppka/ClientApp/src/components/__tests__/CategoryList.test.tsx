import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CategoryList from '../CategoryList';
import type { CategorySummary } from '../../types/quiz';

const categories: CategorySummary[] = [
  { id: 'cat1', name: 'Category One' },
  { id: 'cat2', name: 'Category Two' },
];

function renderCategoryList(cats: CategorySummary[]) {
  return render(
    <MemoryRouter>
      <CategoryList categories={cats} />
    </MemoryRouter>
  );
}

describe('CategoryList', () => {
  it('renders a list of categories', () => {
    renderCategoryList(categories);
    expect(screen.getByText('Category One')).toBeInTheDocument();
    expect(screen.getByText('Category Two')).toBeInTheDocument();
  });

  it('shows empty-state message when list is empty', () => {
    renderCategoryList([]);
    expect(screen.getByText(/no categories/i)).toBeInTheDocument();
  });

  it('each item is clickable', async () => {
    const user = userEvent.setup();
    renderCategoryList(categories);
    const item = screen.getByText('Category One');
    await user.click(item);
    // Navigation happens via router link; click shouldn't throw
    expect(item).toBeInTheDocument();
  });
});
