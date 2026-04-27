import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageRebusQuestion from '../ImageRebusQuestion';
import type { ImageRebusQuestion as ImageRebusQuestionType } from '../../types/quiz';

const question: ImageRebusQuestionType = {
  id: 'q1',
  type: 'image-rebus',
  prompt: 'What is in the image?',
  imageRef: 'rebus/test.png',
};

describe('ImageRebusQuestion', () => {
  it('renders image with correct src', () => {
    render(<ImageRebusQuestion question={question} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/rebus/test.png');
  });

  it('renders the prompt', () => {
    render(<ImageRebusQuestion question={question} />);
    expect(screen.getByText('What is in the image?')).toBeInTheDocument();
  });

  it('shows error placeholder when image fails to load', async () => {
    render(<ImageRebusQuestion question={question} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', question.prompt);
    // Trigger error event using fireEvent which wraps in act automatically
    fireEvent.error(img);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  describe('displayMode', () => {
    it('renders prompt as h4 by default (presenter mode)', () => {
      render(<ImageRebusQuestion question={question} />);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('What is in the image?');
    });

    it('renders prompt as h2 in mirror mode', () => {
      render(<ImageRebusQuestion question={question} displayMode="mirror" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('What is in the image?');
    });

    it('image has maxHeight 70vh by default (presenter mode)', () => {
      render(<ImageRebusQuestion question={question} />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ maxHeight: '70vh' });
    });

    it('image has maxHeight 80vh in mirror mode', () => {
      render(<ImageRebusQuestion question={question} displayMode="mirror" />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ maxHeight: '80vh' });
    });
  });
});
