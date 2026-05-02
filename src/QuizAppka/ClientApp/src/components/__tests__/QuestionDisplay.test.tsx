import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestionDisplay from '../QuestionDisplay';
import type { Question, RevealState } from '../../types/quiz';

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

  it('renders MemeQuestion for meme type', () => {
    const q: Question = {
      id: 'q1',
      type: 'meme',
      prompt: 'Meme question?',
      entryImage: 'meme.jpg',
      options: [{ id: 'a', text: 'Option A' }],
    };
    render(<QuestionDisplay question={q} />);
    expect(screen.getByText('Meme question?')).toBeInTheDocument();
    expect(screen.getByTestId('meme-image')).toBeInTheDocument();
  });

  it('passes revealState to MemeQuestion', () => {
    const q: Question = {
      id: 'q1',
      type: 'meme',
      prompt: 'Meme?',
      entryImage: 'entry.jpg',
      revealImage: 'reveal.jpg',
      options: [],
    };
    const revealState: RevealState = { memeImageRevealed: true };
    render(<QuestionDisplay question={q} revealState={revealState} />);
    const img = screen.getByTestId('meme-image');
    expect(img).toHaveAttribute('src', '/images/reveal.jpg');
  });

  it('renders SingingPianos for singing-pianos type', () => {
    const q: Question = {
      id: 'q1',
      type: 'singing-pianos',
      prompt: 'Piano?',
      boxes: [
        { id: 'b1', hiddenText: 'DO' },
        { id: 'b2', hiddenText: 'RE' },
      ],
    };
    render(<QuestionDisplay question={q} />);
    expect(screen.getByText('Piano?')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('passes revealedBoxes to SingingPianos via revealState', () => {
    const q: Question = {
      id: 'q1',
      type: 'singing-pianos',
      prompt: 'Piano?',
      boxes: [
        { id: 'b1', hiddenText: 'DO' },
        { id: 'b2', hiddenText: 'RE' },
      ],
    };
    const revealState: RevealState = {
      singingPianosBoxesRevealed: [
        { id: 'b1', revealed: true },
        { id: 'b2', revealed: false },
      ],
    };
    render(<QuestionDisplay question={q} revealState={revealState} />);
    expect(screen.getByTestId('piano-box-0')).toHaveTextContent('DO');
    expect(screen.getByTestId('piano-box-1')).toHaveTextContent('?');
  });

  it('renders fallback message for unknown type', () => {
    // Cast to bypass TypeScript type check - simulates unknown type from API
    const q = { id: 'q1', type: 'unknown', prompt: '?' } as unknown as Question;
    render(<QuestionDisplay question={q} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
