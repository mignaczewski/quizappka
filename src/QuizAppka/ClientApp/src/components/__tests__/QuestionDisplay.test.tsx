import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestionDisplay from '../QuestionDisplay';
import type { Question } from '../../types/quiz';

describe('QuestionDisplay', () => {
  it('renders OpenQuestion for open type', () => {
    const q: Question = { id: 'q1', type: 'open', prompt: 'Open question?' };
    render(<QuestionDisplay question={q} />);
    expect(screen.getByText('Open question?')).toBeInTheDocument();
  });

  it('renders ClosedQuestion for closed type', () => {
    const q: Question = {
      id: 'q1',
      type: 'closed',
      prompt: 'Closed question?',
      options: [{ id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' }],
    };
    render(<QuestionDisplay question={q} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('renders ImageRebusQuestion for image-rebus type', () => {
    const q: Question = {
      id: 'q1',
      type: 'image-rebus',
      prompt: 'What is this?',
      imageRef: 'rebus/test.png',
    };
    render(<QuestionDisplay question={q} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders fallback message for unknown type', () => {
    // Cast to bypass TypeScript type check - simulates unknown type from API
    const q = { id: 'q1', type: 'unknown', prompt: '?' } as unknown as Question;
    render(<QuestionDisplay question={q} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
