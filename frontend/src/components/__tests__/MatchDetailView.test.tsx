import { render, screen } from '@testing-library/react';
import MatchDetailView from '../MatchDetailView';
import type { CandidateProfile, MatchDetail } from '../../types';

const candidate: CandidateProfile = {
  id: '42',
  name: 'Casey Lee',
  role: 'Product Designer',
  matchScore: 75,
  skills: [
    { name: 'Figma', level: 'high' },
    { name: 'User Research', level: 'medium', evidence: 'Conducted 20+ interviews' }
  ],
  explanation: {
    chainOfThought: 'Strong research background with solid UI craft.',
    greenFlags: ['User-centered approach'],
    redFlags: ['Limited design system experience']
  }
};

const detail: MatchDetail = {
  jobDescription: 'Design enterprise workflows with strong attention to accessibility.',
  resumeText: 'Experience crafting UX flows for internal tools and user testing.',
  explanation: {
    matchScore: 75,
    chainOfThought: 'Research strengths align with product needs.',
    greenFlags: ['Runs usability tests'],
    redFlags: ['Needs more design system work']
  },
  skills: candidate.skills
};

describe('MatchDetailView', () => {
  it('renders job and resume details with explanations', () => {
    render(<MatchDetailView candidate={candidate} detail={detail} />);

    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    expect(screen.getByText('Casey Lee')).toBeInTheDocument();
    expect(screen.getByText('Job Description')).toBeInTheDocument();
    expect(screen.getByText('Glass Box Explanation')).toBeInTheDocument();
    expect(screen.getByText('Why this candidate?')).toBeInTheDocument();
    expect(screen.getByText('Research strengths align with product needs.')).toBeInTheDocument();
    expect(screen.getByText('Runs usability tests')).toBeInTheDocument();
    expect(screen.getByText('Needs more design system work')).toBeInTheDocument();
  });
});
