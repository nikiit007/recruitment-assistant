import React from 'react';
import CandidateCard from './components/CandidateCard';
import DiversitySankey from './components/DiversitySankey';
import MatchDetailView from './components/MatchDetailView';
import { CandidateProfile, MatchDetail } from './types';

const candidates: CandidateProfile[] = [
  {
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
      { name: 'DevOps', level: 'low' },
    ],
    summary: 'Engineer focused on user-centric product features with strong testing discipline.',
    highlights: ['Shipped analytics suite improving activation by 12%', 'Mentors two junior engineers'],
    explanation: {
      chainOfThought: 'Strong frontend expertise with solid backend experience; aligns with role requirements.',
      greenFlags: ['Demonstrated ownership of full-stack projects', 'Experience with design systems'],
      redFlags: ['Limited infrastructure exposure'],
    },
  },
  {
    id: '2',
    name: 'Taylor Chen',
    role: 'Full-Stack Engineer',
    matchScore: 88,
    yearsExperience: 7,
    location: 'Seattle',
    skills: [
      { name: 'React', level: 'high', evidence: 'Built internal portal serving 5 teams' },
      { name: 'Next.js', level: 'medium', evidence: 'Owns SSR performance' },
      { name: 'Node.js', level: 'high', evidence: 'Designs backend APIs' },
      { name: 'Databases', level: 'medium', evidence: 'Optimized slow queries' },
      { name: 'Testing', level: 'medium' },
      { name: 'DevOps', level: 'low' },
    ],
    summary: 'Generalist engineer with a record of delivery for growth-stage teams.',
    highlights: ['Scaled SSR pages to <1s TTFB', 'Partnered with design for accessibility revamp'],
    explanation: {
      chainOfThought: 'Comfortable across stack with emphasis on DX and web performance.',
      greenFlags: ['Owns performance budgets', 'Shipped cross-team initiatives'],
      redFlags: ['Lighter cloud automation exposure'],
    },
  },
  {
    id: '3',
    name: 'Priya Desai',
    role: 'Full-Stack Engineer',
    matchScore: 86,
    yearsExperience: 5,
    location: 'Remote - EST',
    skills: [
      { name: 'TypeScript', level: 'high', evidence: 'Built typed SDK for partners' },
      { name: 'React', level: 'high', evidence: 'Created component library' },
      { name: 'GraphQL', level: 'medium', evidence: 'Defined shared schemas' },
      { name: 'Go', level: 'medium', evidence: 'Maintains auth service' },
      { name: 'Testing', level: 'medium', evidence: 'Introduced contract testing' },
      { name: 'DevOps', level: 'medium' },
    ],
    summary: 'Builder who pairs product thinking with dependable delivery of platform features.',
    highlights: ['Launched partner API with 99.9% uptime', 'Runs inclusive interviewing loop'],
    explanation: {
      chainOfThought: 'Strong frontend depth plus service ownership; brings reliability mindset.',
      greenFlags: ['Owns partner-facing APIs', 'Introduced contract testing'],
      redFlags: ['Has not led large team yet'],
    },
  },
  {
    id: '4',
    name: 'Samira Holt',
    role: 'Full-Stack Engineer',
    matchScore: 83,
    yearsExperience: 8,
    location: 'Denver',
    skills: [
      { name: 'TypeScript', level: 'medium', evidence: 'Migrated legacy JS modules' },
      { name: 'React', level: 'high', evidence: 'Leads UI modernization efforts' },
      { name: 'Node.js', level: 'high', evidence: 'Owns messaging services' },
      { name: 'GraphQL', level: 'low' },
      { name: 'Testing', level: 'medium', evidence: 'Adds visual regression coverage' },
      { name: 'DevOps', level: 'medium', evidence: 'Builds CI pipelines' },
    ],
    summary: 'Seasoned contributor who modernizes stacks and hardens release pipelines.',
    highlights: ['Cut deployment time by 40%', 'Rebuilt design tokens with design partners'],
    explanation: {
      chainOfThought: 'Systems-minded engineer with UI polish and delivery maturity.',
      greenFlags: ['Owns CI/CD improvements', 'Expert in UI modernization'],
      redFlags: ['GraphQL practice is emerging'],
    },
  },
  {
    id: '5',
    name: 'Diego Martins',
    role: 'Full-Stack Engineer',
    matchScore: 80,
    yearsExperience: 6,
    location: 'Austin',
    skills: [
      { name: 'TypeScript', level: 'medium', evidence: 'Refined typings for APIs' },
      { name: 'React', level: 'medium', evidence: 'Delivers feature pods end-to-end' },
      { name: 'Node.js', level: 'medium', evidence: 'Maintains billing integrations' },
      { name: 'Python', level: 'medium' },
      { name: 'Testing', level: 'medium', evidence: 'Adds monitoring to services' },
      { name: 'DevOps', level: 'low' },
    ],
    summary: 'Pragmatic engineer comfortable collaborating with product and data partners.',
    highlights: ['Improved billing reliability by 15%', 'Runs weekly incident reviews'],
    explanation: {
      chainOfThought: 'Solid fundamentals with good collaboration and operational discipline.',
      greenFlags: ['Experience with billing and reliability', 'Communicates clearly with stakeholders'],
      redFlags: ['Still ramping on advanced frontend patterns'],
    },
  },
];

const candidateDetails: Record<string, MatchDetail> = {
  '1': {
    jobDescription: 'We are hiring a full-stack engineer to build data-rich dashboards and secure APIs.',
    resumeText: '6 years experience building frontend and backend features across multiple products.',
    explanation: {
      matchScore: 92,
      chainOfThought: 'Candidate shows strengths across TS/React with proven delivery.',
      greenFlags: ['Has led migrations and mentoring'],
      redFlags: ['Infrastructure exposure is lighter'],
    },
    skills: candidates[0].skills,
  },
  '2': {
    jobDescription: 'Full-stack engineer to partner with design on performance and accessibility.',
    resumeText: '7 years experience in growth-stage companies with emphasis on SSR and web vitals.',
    explanation: {
      matchScore: 88,
      chainOfThought: 'Demonstrates SSR ownership and accessibility improvements that map to roadmap.',
      greenFlags: ['Owns performance budgets', 'Mentors designers on a11y'],
      redFlags: ['Needs support on cloud automation'],
    },
    skills: candidates[1].skills,
  },
  '3': {
    jobDescription: 'Full-stack engineer to steward partner APIs and build a cohesive UI kit.',
    resumeText: '5 years experience across platform teams building SDKs and contract-tested services.',
    explanation: {
      matchScore: 86,
      chainOfThought: 'Brings API ownership and reliable delivery; aligns with partner integrations.',
      greenFlags: ['Built typed SDK', 'Introduced contract testing discipline'],
      redFlags: ['Has limited people leadership exposure'],
    },
    skills: candidates[2].skills,
  },
  '4': {
    jobDescription: 'Engineer to modernize a React/Node stack and tighten release quality.',
    resumeText: '8 years modernizing UIs, migrating legacy modules, and hardening CI/CD pipelines.',
    explanation: {
      matchScore: 83,
      chainOfThought: 'Systems mindset fits modernization goals; breadth across FE/BE pipelines.',
      greenFlags: ['CI/CD specialist', 'UI modernization experience'],
      redFlags: ['GraphQL practice is still developing'],
    },
    skills: candidates[3].skills,
  },
  '5': {
    jobDescription: 'Engineer to own billing flows while building reliable, typed React features.',
    resumeText: '6 years delivering billing, monitoring, and full-stack features with product partners.',
    explanation: {
      matchScore: 80,
      chainOfThought: 'Steady delivery across billing and monitoring with collaborative habits.',
      greenFlags: ['Improved billing reliability', 'Communicates incidents clearly'],
      redFlags: ['Needs guidance on complex frontend architecture'],
    },
    skills: candidates[4].skills,
  },
};

function App() {
  const [activeCandidateId, setActiveCandidateId] = React.useState<string>(candidates[0].id);
  const activeCandidate = candidates.find((c) => c.id === activeCandidateId) ?? candidates[0];
  const activeDetail = candidateDetails[activeCandidate.id];

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <div className="eyebrow">Recruitment Assistant</div>
          <h1>Quality matches without losing transparency</h1>
          <p>
            A modern recruiter cockpit combining AI scoring, transparent reasoning, and bias-aware insights.
          </p>
          <div className="pill-row">
            <span className="pill">Real-time match scoring</span>
            <span className="pill">Glass-box explanations</span>
            <span className="pill">Bias guardrails</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-metric">
            <small>Top candidate score</small>
            <strong>{Math.max(...candidates.map((c) => c.matchScore))}</strong>
            <span>High alignment with full-stack requisition</span>
          </div>
          <div className="hero-card">
            <small>Time saved this week</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>7.5 hrs</strong>
            <span className="secondary-text">Automated screening + structured summaries</span>
          </div>
          <div className="hero-card">
            <small>Signals tracked</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>18</strong>
            <span className="secondary-text">Skills, tenure, ownership, leadership</span>
          </div>
          <div className="hero-card">
            <small>Bias alerts</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>0</strong>
            <span className="secondary-text">Guardrails are active</span>
          </div>
        </div>
      </header>

      <div className="section-shell">
        <div className="page-grid">
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow" style={{ color: '#4f46e5' }}>
                  Shortlist
                </p>
                <h2 className="card-title">Best next conversations</h2>
                <p className="secondary-text">Curated matches scored against the active requisition.</p>
              </div>
              <div className="warning-banner" style={{ visibility: 'hidden' }}>
                <span>⚠</span>Safety layer
              </div>
            </div>
            <div className="candidate-list">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} onSelect={setActiveCandidateId} />
              ))}
            </div>
          </section>

          <section className="card detail-shell">
            <MatchDetailView candidate={activeCandidate} detail={activeDetail} />
          </section>
        </div>

        <section className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow" style={{ color: '#0ea5e9' }}>
                Safety Layer
              </p>
              <h2 className="card-title">Bias & diversity funnel</h2>
              <p className="secondary-text">Track demographic drop-off across the pipeline.</p>
            </div>
            <div className="warning-banner">
              <span>⚡</span> Potential disparate impact surfaced
            </div>
          </div>
          <DiversitySankey candidates={candidates.slice(0, 4)} />
        </section>
      </div>
    </main>
  );
}

export default App;
