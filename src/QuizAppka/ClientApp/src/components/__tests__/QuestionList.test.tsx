import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionList from '../QuestionList';
import type { Question } from '../../types/quiz';

const questions: Question[] = [
  { id: 'q1', type: 'open', prompt: 'What is photosynthesis?' },
  {
    id: 'q2',
    type: 'closed',
    prompt: 'Which planet is closest to the Sun?',
    options: [
      { id: 'a', text: 'Mercury' },
      { id: 'b', text: 'Venus' },
    ],
  },
  { id: 'q3', type: 'image-rebus', prompt: 'What does this image show?', imageRef: 'test.png' },
];

describe('QuestionList', () => {
  it('renders all questions as list entries', () => {
    render(<QuestionList questions={questions} onSelectQuestion={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('shows 1-based question number for each entry', () => {
    render(<QuestionList questions={questions} onSelectQuestion={vi.fn()} />);
    expect(screen.getByText(/1\./)).toBeInTheDocument();
    expect(screen.getByText(/2\./)).toBeInTheDocument();
    expect(screen.getByText(/3\./)).toBeInTheDocument();
  });

  it('shows type badge for each question', () => {
    render(<QuestionList questions={questions} onSelectQuestion={vi.fn()} />);
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('closed')).toBeInTheDocument();
    expect(screen.getByText('image rebus')).toBeInTheDocument();
  });

  it('shows prompt preview for each entry', () => {
    render(<QuestionList questions={questions} onSelectQuestion={vi.fn()} />);
    expect(screen.getByText(/What is photosynthesis/)).toBeInTheDocument();
    expect(screen.getByText(/Which planet is closest/)).toBeInTheDocument();
    expect(screen.getByText(/What does this image show/)).toBeInTheDocument();
  });

  it('calls onSelectQuestion with the correct question id when entry is clicked', async () => {
    const onSelect = vi.fn();
    render(<QuestionList questions={questions} onSelectQuestion={onSelect} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);
    expect(onSelect).toHaveBeenCalledWith('q2');
  });

  it('calls onSelectQuestion with the first question id when first entry is clicked', async () => {
    const onSelect = vi.fn();
    render(<QuestionList questions={questions} onSelectQuestion={onSelect} />);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onSelect).toHaveBeenCalledWith('q1');
  });

  it('renders a single entry without auto-selecting when there is only one question', () => {
    const onSelect = vi.fn();
    render(<QuestionList questions={[questions[0]]} onSelectQuestion={onSelect} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
