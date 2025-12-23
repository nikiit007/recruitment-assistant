import { render, screen } from '@testing-library/react';
import Heatmap from '../Heatmap';

const skills = [
  { name: 'Python', level: 'high', evidence: 'API services' },
  { name: 'React', level: 'medium', evidence: 'Dashboard build' },
  { name: 'Go', level: 'low' }
];

describe('Heatmap', () => {
  it('shows skills with evidence and color indicators', () => {
    render(<Heatmap skills={skills} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('API services')).toBeInTheDocument();
  });
});
