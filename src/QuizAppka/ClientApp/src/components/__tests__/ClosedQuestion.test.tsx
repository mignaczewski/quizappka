import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClosedQuestion from '../ClosedQuestion';
import type { ClosedQuestion as ClosedQuestionType } from '../../types/quiz';

const question: ClosedQuestionType = {
  id: 'q1',
  type: 'closed',
  prompt: 'Which planet is closest to the Sun?',
  options: [
    { id: 'a', text: 'Mercury' },
    { id: 'b', text: 'Venus' },
    { id: 'c', text: 'Earth' },
  ],
};

describe('ClosedQuestion', () => {
  it('renders prompt and all options', () => {
    render(<ClosedQuestion question={question} />);
    expect(screen.getByText('Which planet is closest to the Sun?')).toBeInTheDocument();
    expect(screen.getByText('Mercury')).toBeInTheDocument();
    expect(screen.getByText('Venus')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
  });

  it('option count matches input', () => {
    render(<ClosedQuestion question={question} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('does not render any image', () => {
    render(<ClosedQuestion question={question} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
