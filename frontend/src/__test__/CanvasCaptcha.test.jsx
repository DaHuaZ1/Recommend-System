import { render, screen } from '@testing-library/react';
import CanvasCaptcha from '../components/CanvasCaptcha';

// Mock canvas context
HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    fillText: () => {},
    drawImage: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    closePath: () => {},
    arc: () => {},
    strokeRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    fill: () => {},
  });

describe('CanvasCaptcha Component', () => {
  it('renders canvas with given text', () => {
    render(<CanvasCaptcha text="TEST" />);
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });
});