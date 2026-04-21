import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OpenQuestion from '../OpenQuestion';

describe('OpenQuestion', () => {
  it('renders the prompt text', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'What is 2+2?' }} />);
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });

  it('does not render any list items (no options)', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?' }} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('does not render any image', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?' }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render hint section when presenterHint is absent', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?' }} />);
    expect(screen.queryByTestId('presenter-hint')).not.toBeInTheDocument();
  });

  it('renders plain text presenterHint when provided', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'The answer is 42.' }} />);
    expect(screen.getByTestId('presenter-hint')).toBeInTheDocument();
    expect(screen.getByText('The answer is 42.')).toBeInTheDocument();
  });

  it('renders presenterHint as a link when it starts with https://', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'https://example.com/hint' }} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/hint');
  });

  it('renders presenterHint as a link when it starts with http://', () => {
    render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'http://example.com/hint' }} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'http://example.com/hint');
  });
});
