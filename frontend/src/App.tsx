import React from 'react';
import CandidateCard from './components/CandidateCard';
import DiversitySankey from './components/DiversitySankey';
import MatchDetailView from './components/MatchDetailView';
import { CandidateProfile, MatchDetail } from './types';

const demoCandidate: CandidateProfile = {
  id: '1',
  name: 'Jordan Alvarez',
  role: 'Full-Stack Engineer',
  matchScore: 92,
  yearsExperience: 6,
  location: 'Remote',
  skills: [
    { name: 'TypeScript', level: 'high', evidence: 'Led TypeScript migration for core app' },
    { name: 'React', level: 'high', evidence: 'Built design system components' },
    { name: 'Node.js', level: 'medium', evidence: 'Maintains internal services' },
    { name: 'GraphQL', level: 'medium' },
    { name: 'Testing', level: 'high', evidence: 'Added Vitest + RTL coverage' },
    { name: 'DevOps', level: 'low' }
  ],
  summary: 'Engineer focused on user-centric product features with strong testing discipline.',
  highlights: ['Shipped analytics suite improving activation by 12%', 'Mentors two junior engineers'],
  explanation: {
    chainOfThought: 'Strong frontend expertise with solid backend experience; aligns with role requirements.',
    greenFlags: ['Demonstrated ownership of full-stack projects', 'Experience with design systems'],
    redFlags: ['Limited infrastructure exposure']
  }
};

const demoDetail: MatchDetail = {
  jobDescription: 'We are hiring a full-stack engineer to build data-rich dashboards and secure APIs.',
  resumeText: '6 years experience building frontend and backend features across multiple products.',
  explanation: {
    matchScore: 92,
    chainOfThought: 'Candidate shows strengths across TS/React with proven delivery.',
    greenFlags: ['Has led migrations and mentoring'],
    redFlags: ['Infrastructure exposure is lighter']
  },
  skills: demoCandidate.skills
};

function App() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Recruitment Assistant UI</h1>
      <section className="grid gap-4 sm:grid-cols-2">
        <CandidateCard candidate={demoCandidate} />
        <MatchDetailView candidate={demoCandidate} detail={demoDetail} />
      </section>
      <DiversitySankey candidates={[demoCandidate]} />
    </main>
  );
}

export default App;
