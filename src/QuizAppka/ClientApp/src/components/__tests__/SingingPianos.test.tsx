import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingingPianos from '../SingingPianos';
import type { SingingPianosQuestion as SingingPianosQuestionType, PianoBoxReveal } from '../../types/quiz';

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

  it('reveals text of a box when its entry in revealedBoxes has revealed: true', () => {
    const revealedBoxes: PianoBoxReveal[] = [{ id: 'box1', revealed: true }];
    render(<SingingPianos question={question} revealedBoxes={revealedBoxes} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');
    expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
  });

  it('does not reveal a box whose entry has revealed: false', () => {
    const revealedBoxes: PianoBoxReveal[] = [{ id: 'box1', revealed: false }];
    render(<SingingPianos question={question} revealedBoxes={revealedBoxes} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('?');
  });

  it('reveals a non-first box by id regardless of array order', () => {
    const revealedBoxes: PianoBoxReveal[] = [{ id: 'box3', revealed: true }];
    render(<SingingPianos question={question} revealedBoxes={revealedBoxes} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('?');
    expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
    expect(screen.getByTestId('piano-box-2')).toHaveTextContent('MI');
    expect(screen.getByTestId('piano-box-3')).toHaveTextContent('?');
  });

  it('calls onBoxReveal with the box id when unrevealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    render(<SingingPianos question={question} onBoxReveal={onBoxReveal} />);
    await userEvent.click(screen.getByTestId('piano-box-2'));
    expect(onBoxReveal).toHaveBeenCalledWith('box3');
  });

  it('does not call onBoxReveal when already revealed box is clicked', async () => {
    const onBoxReveal = vi.fn();
    const revealedBoxes: PianoBoxReveal[] = [{ id: 'box3', revealed: true }];
    render(
      <SingingPianos
        question={question}
        revealedBoxes={revealedBoxes}
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

  describe('displayMode', () => {
    it('renders prompt as h4 by default (presenter mode)', () => {
      render(<SingingPianos question={question} />);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Press to reveal!');
    });

    it('renders prompt as h2 in mirror mode', () => {
      render(<SingingPianos question={question} displayMode="mirror" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Press to reveal!');
    });
  });

  describe('presenterHint', () => {
    const questionWithHint: SingingPianosQuestionType = {
      ...question,
      presenterHint: 'All You Need Is Love',
    };
    const questionWithUrlHint: SingingPianosQuestionType = {
      ...question,
      presenterHint: 'https://example.com/source',
    };

    it('renders hint text in presenter mode (default)', () => {
      render(<SingingPianos question={questionWithHint} />);
      expect(screen.getByTestId('presenter-hint')).toHaveTextContent('All You Need Is Love');
    });

    it('renders hint as a link when hint is a URL', () => {
      render(<SingingPianos question={questionWithUrlHint} />);
      const link = screen.getByRole('link', { name: 'https://example.com/source' });
      expect(link).toHaveAttribute('href', 'https://example.com/source');
    });

    it('does not render hint in mirror mode', () => {
      render(<SingingPianos question={questionWithHint} displayMode="mirror" />);
      expect(screen.queryByTestId('presenter-hint')).not.toBeInTheDocument();
    });

    it('does not render hint block when presenterHint is undefined', () => {
      render(<SingingPianos question={question} />);
      expect(screen.queryByTestId('presenter-hint')).not.toBeInTheDocument();
    });
  });
});
