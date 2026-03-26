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
});
