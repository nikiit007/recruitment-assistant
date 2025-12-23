import { render, screen } from '@testing-library/react';
import DiversitySankey from '../DiversitySankey';
import type { CandidateProfile } from '../../types';
import React from 'react';
import { vi } from 'vitest';

vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive">{children}</div>,
    Sankey: ({ children }: { children: React.ReactNode }) => <div data-testid="sankey">{children}</div>,
    Tooltip: ({ content }: { content?: React.ReactNode }) => <div data-testid="tooltip">{content}</div>
  };
});

const candidates: CandidateProfile[] = [
  {
    id: 'c1',
    name: 'Alex Kim',
    role: 'Data Scientist',
    matchScore: 82,
    skills: [
      { name: 'Python', level: 'high' },
      { name: 'SQL', level: 'high' },
      { name: 'Dashboards', level: 'medium' }
    ]
  },
  {
    id: 'c2',
    name: 'Taylor Singh',
    role: 'Analyst',
    matchScore: 70,
    skills: [
      { name: 'Excel', level: 'high' },
      { name: 'Python', level: 'medium' }
    ]
  }
];

describe('DiversitySankey', () => {
  it('surfaces diversity warnings and renders group stats', () => {
    const randomValues = [0.9, 0.1, 0.3, 0.2, 0.95, 0.1];
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0.9);

    render(<DiversitySankey candidates={candidates} />);

    expect(screen.getByText('Bias & Diversity Funnel')).toBeInTheDocument();
    expect(screen.getByText('Potential Disparate Impact Detected')).toBeInTheDocument();
    expect(screen.getAllByText(/Applicants/)).not.toHaveLength(0);
    expect(screen.getByTestId('sankey')).toBeInTheDocument();

    randomSpy.mockRestore();
  });
});
