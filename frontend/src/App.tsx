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
    redFlags: ['Limited infrastructure exposure'],
  },
};

const demoDetail: MatchDetail = {
  jobDescription: 'We are hiring a full-stack engineer to build data-rich dashboards and secure APIs.',
  resumeText: '6 years experience building frontend and backend features across multiple products.',
  explanation: {
    matchScore: 92,
    chainOfThought: 'Candidate shows strengths across TS/React with proven delivery.',
    greenFlags: ['Has led migrations and mentoring'],
    redFlags: ['Infrastructure exposure is lighter'],
  },
  skills: demoCandidate.skills,
};

function App() {
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
            <strong>92</strong>
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
              <CandidateCard candidate={demoCandidate} />
              <CandidateCard candidate={{ ...demoCandidate, id: '2', name: 'Taylor Chen', matchScore: 88 }} />
            </div>
          </section>

          <section className="card detail-shell">
            <MatchDetailView candidate={demoCandidate} detail={demoDetail} />
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
          <DiversitySankey candidates={[demoCandidate]} />
        </section>
      </div>
    </main>
  );
}

export default App;
