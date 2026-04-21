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

  it('does not render hint section when presenterHint is absent', () => {
    render(<ClosedQuestion question={question} />);
    expect(screen.queryByTestId('presenter-hint')).not.toBeInTheDocument();
  });

  it('renders plain text presenterHint when provided', () => {
    const withHint: ClosedQuestionType = { ...question, presenterHint: 'Mercury is the answer.' };
    render(<ClosedQuestion question={withHint} />);
    expect(screen.getByTestId('presenter-hint')).toBeInTheDocument();
    expect(screen.getByText('Mercury is the answer.')).toBeInTheDocument();
  });

  it('renders presenterHint as a link when it starts with https://', () => {
    const withHint: ClosedQuestionType = { ...question, presenterHint: 'https://example.com/hint' };
    render(<ClosedQuestion question={withHint} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/hint');
  });

  it('renders presenterHint as a link when it starts with http://', () => {
    const withHint: ClosedQuestionType = { ...question, presenterHint: 'http://example.com/hint' };
    render(<ClosedQuestion question={withHint} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'http://example.com/hint');
  });
});
