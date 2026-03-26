import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavigationBar from '../NavigationBar';

describe('NavigationBar', () => {
  it('disables the Previous button at index 0', () => {
    render(
      <NavigationBar
        index={0}
        total={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('shows Next button when not at last index', () => {
    render(
      <NavigationBar
        index={0}
        total={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('disables Next button at last index', () => {
    render(
      <NavigationBar
        index={2}
        total={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPrevious when Previous is clicked', async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    render(
      <NavigationBar
        index={1}
        total={3}
        onPrevious={onPrevious}
        onNext={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it('calls onNext when Next is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <NavigationBar
        index={1}
        total={3}
        onPrevious={vi.fn()}
        onNext={onNext}
      />
    );
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
