import { render, screen } from '@testing-library/react';
import CandidateCard from '../CandidateCard';
import type { CandidateProfile } from '../../types';

const candidate: CandidateProfile = {
  id: '123',
  name: 'Ada Lovelace',
  role: 'ML Engineer',
  matchScore: 87.6,
  skills: [
    { name: 'Python', level: 'high', evidence: '10+ years writing Python services' },
    { name: 'TensorFlow', level: 'medium', evidence: 'Built training pipelines' },
    { name: 'MLOps', level: 'low', evidence: 'Learning deployment best practices' }
  ],
  summary: 'Pioneer in computer science and algorithm design.',
  highlights: ['First to publish an algorithm intended for machine execution'],
  explanation: {
    chainOfThought: 'Strong fundamentals with modern ML experience.',
    greenFlags: ['Deep mathematical background'],
    redFlags: ['Limited production deployment exposure']
  }
};

describe('CandidateCard', () => {
  it('renders candidate details and skill badges', () => {
    render(<CandidateCard candidate={candidate} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ML Engineer')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('AI Match Score')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
  });
});
