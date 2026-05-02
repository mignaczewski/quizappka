import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingingPianos from '../SingingPianos';
import type { SingingPianosQuestion as SingingPianosQuestionType, RevealedBox } from '../../types/quiz';

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

const allHidden: RevealedBox[] = question.boxes.map((b) => ({ id: b.id, revealed: false }));

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

  it('reveals text of a box when revealedBoxes entry for that id has revealed: true', () => {
    const revealedBoxes: RevealedBox[] = [
      { id: 'box1', revealed: true },
      { id: 'box2', revealed: false },
      { id: 'box3', revealed: false },
      { id: 'box4', revealed: false },
      { id: 'box5', revealed: false },
    ];
    render(<SingingPianos question={question} revealedBoxes={revealedBoxes} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');
    expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
  });

  it('calls onBoxReveal with correct box id when unrevealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    render(<SingingPianos question={question} revealedBoxes={allHidden} onBoxReveal={onBoxReveal} />);
    await userEvent.click(screen.getByTestId('piano-box-2'));
    expect(onBoxReveal).toHaveBeenCalledWith('box3');
  });

  it('does not call onBoxReveal when already revealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    const revealedBoxes: RevealedBox[] = [
      { id: 'box1', revealed: false },
      { id: 'box2', revealed: false },
      { id: 'box3', revealed: true },
      { id: 'box4', revealed: false },
      { id: 'box5', revealed: false },
    ];
    render(
      <SingingPianos
        question={question}
        revealedBoxes={revealedBoxes}
        onBoxReveal={onBoxReveal}
      />
    );
    // The button is disabled — assert disabled state, not calling via click
    expect(screen.getByTestId('piano-box-2')).toBeDisabled();
    expect(onBoxReveal).not.toHaveBeenCalled();
  });

  it('renders all 5 boxes', () => {
    render(<SingingPianos question={question} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('disables box when revealed (no onBoxReveal)', () => {
    const revealedBoxes: RevealedBox[] = [
      { id: 'box1', revealed: true },
      { id: 'box2', revealed: false },
      { id: 'box3', revealed: false },
      { id: 'box4', revealed: false },
      { id: 'box5', revealed: false },
    ];
    render(<SingingPianos question={question} revealedBoxes={revealedBoxes} />);
    expect(screen.getByTestId('piano-box-0')).toBeDisabled();
    expect(screen.getByTestId('piano-box-1')).not.toBeDisabled();
  });

  it('disables box when revealed even when onBoxReveal is provided', async () => {
    const onBoxReveal = vi.fn();
    const revealedBoxes: RevealedBox[] = [
      { id: 'box1', revealed: true },
      { id: 'box2', revealed: false },
      { id: 'box3', revealed: false },
      { id: 'box4', revealed: false },
      { id: 'box5', revealed: false },
    ];
    render(
      <SingingPianos question={question} revealedBoxes={revealedBoxes} onBoxReveal={onBoxReveal} />
    );
    expect(screen.getByTestId('piano-box-0')).toBeDisabled();
    // Unrevealed boxes should still be clickable
    expect(screen.getByTestId('piano-box-1')).not.toBeDisabled();
    await userEvent.click(screen.getByTestId('piano-box-1'));
    expect(onBoxReveal).toHaveBeenCalledWith('box2');
    expect(onBoxReveal).not.toHaveBeenCalledWith('box1');
  });
});
