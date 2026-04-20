import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingingPianos from '../SingingPianos';
import type { SingingPianosQuestion as SingingPianosQuestionType } from '../../types/quiz';

const question: SingingPianosQuestionType = {
  id: 'q1',
  type: 'singing-pianos',
  prompt: 'Press to reveal!',
  boxes: [
    { id: 'box1', hiddenText: 'DO' },
    { id: 'box2', hiddenText: 'RE' },
    { id: 'box3', hiddenText: 'MI' },
    { id: 'box4', hiddenText: 'FA' },
    { id: 'box5', hiddenText: 'SOL' },
  ],
};

describe('SingingPianos', () => {
  it('renders prompt', () => {
    render(<SingingPianos question={question} />);
    expect(screen.getByText('Press to reveal!')).toBeInTheDocument();
  });

  it('renders all boxes with hidden text placeholder by default', () => {
    render(<SingingPianos question={question} />);
    const boxes = question.boxes.map((_, i) => screen.getByTestId(`piano-box-${i}`));
    expect(boxes).toHaveLength(5);
    boxes.forEach((box) => expect(box).toHaveTextContent('?'));
  });

  it('reveals text of a box when revealedBoxes[index] is true', () => {
    render(<SingingPianos question={question} revealedBoxes={[true, false, false, false, false]} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');
    expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
  });

  it('calls onBoxReveal with correct index when unrevealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    render(<SingingPianos question={question} onBoxReveal={onBoxReveal} />);
    await userEvent.click(screen.getByTestId('piano-box-2'));
    expect(onBoxReveal).toHaveBeenCalledWith(2);
  });

  it('does not call onBoxReveal when already revealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    render(
      <SingingPianos
        question={question}
        revealedBoxes={[false, false, true, false, false]}
        onBoxReveal={onBoxReveal}
      />
    );
    await userEvent.click(screen.getByTestId('piano-box-2'));
    expect(onBoxReveal).not.toHaveBeenCalled();
  });

  it('renders all 5 boxes', () => {
    render(<SingingPianos question={question} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
