import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MemeQuestion from '../MemeQuestion';
import type { MemeQuestion as MemeQuestionType } from '../../types/quiz';

const question: MemeQuestionType = {
  id: 'q1',
  type: 'meme',
  prompt: 'Which meme is this?',
  entryImage: 'meme-entry.jpg',
  revealImage: 'meme-reveal.jpg',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
  ],
};

describe('MemeQuestion', () => {
  it('renders prompt and options', () => {
    render(<MemeQuestion question={question} />);
    expect(screen.getByText('Which meme is this?')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('shows entry image initially', () => {
    render(<MemeQuestion question={question} />);
    const img = screen.getByTestId('meme-image');
    expect(img).toHaveAttribute('src', '/images/meme-entry.jpg');
  });

  it('shows reveal image when revealImage is true', () => {
    render(<MemeQuestion question={question} revealImage={true} />);
    const img = screen.getByTestId('meme-image');
    expect(img).toHaveAttribute('src', '/images/meme-reveal.jpg');
  });

  it('shows reveal button when not yet revealed and onReveal is provided', () => {
    const onReveal = vi.fn();
    render(<MemeQuestion question={question} onReveal={onReveal} />);
    expect(screen.getByTestId('reveal-image-button')).toBeInTheDocument();
  });

  it('does not show reveal button when already revealed', () => {
    const onReveal = vi.fn();
    render(<MemeQuestion question={question} revealImage={true} onReveal={onReveal} />);
    expect(screen.queryByTestId('reveal-image-button')).not.toBeInTheDocument();
  });

  it('calls onReveal when reveal button is clicked', async () => {
    const onReveal = vi.fn();
    render(<MemeQuestion question={question} onReveal={onReveal} />);
    await userEvent.click(screen.getByTestId('reveal-image-button'));
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it('does not show reveal button when no onReveal callback (mirror mode)', () => {
    render(<MemeQuestion question={question} />);
    expect(screen.queryByTestId('reveal-image-button')).not.toBeInTheDocument();
  });
});
