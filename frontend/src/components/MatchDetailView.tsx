import React from 'react';
import Heatmap from './Heatmap';
import { CandidateProfile, MatchDetail } from '../types';

type MatchDetailViewProps = {
  candidate: CandidateProfile;
  detail: MatchDetail;
  onBack?: () => void;
};

export const MatchDetailView: React.FC<MatchDetailViewProps> = ({ candidate, detail, onBack }) => {
  return (
    <div className="detail-shell">
      <div className="detail-banner">
        <div>
          <p className="eyebrow" style={{ color: '#c7d2fe' }}>
            Active Requisition
          </p>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{candidate.role}</div>
          <p className="secondary-text" style={{ color: '#cbd5e1' }}>{candidate.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="detail-score">
            <p className="secondary-text" style={{ color: '#dbeafe', margin: 0 }}>
              AI Match Score
            </p>
            <p className="detail-score-number">{Math.round(detail.explanation.matchScore)}</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid rgba(248, 250, 252, 0.5)',
                background: 'rgba(255,255,255,0.08)',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          )}
        </div>
      </div>

      <div className="detail-panel">
        <div className="detail-column">
          <h3>Job Description</h3>
          <p className="detail-copy">{detail.jobDescription}</p>
          <h3>Candidate Resume</h3>
          <p className="detail-copy">{detail.resumeText}</p>
        </div>
        <div className="detail-column">
          <div className="panel">
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <p className="eyebrow" style={{ color: '#4f46e5' }}>
                  Glass Box Explanation
                </p>
                <h3 style={{ margin: 0, fontSize: 17 }}>Why this candidate?</h3>
              </div>
              <span className="pill" style={{ background: '#eef2ff', color: '#312e81', border: 'none' }}>
                Score: {Math.round(detail.explanation.matchScore)}
              </span>
            </div>
            <p className="detail-copy" style={{ marginTop: -2 }}>{detail.explanation.chainOfThought}</p>
            <div className="flag-grid">
              <div className="flag-card">
                <strong style={{ color: '#166534' }}>Green Flags</strong>
                <ul>
                  {detail.explanation.greenFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
              <div className="flag-card red">
                <strong style={{ color: '#b91c1c' }}>Red Flags</strong>
                <ul>
                  {detail.explanation.redFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="card-header" style={{ marginBottom: 0 }}>
              <h4 style={{ margin: 0, fontSize: 15 }}>Skill heatmap</h4>
              <div className="legend">
                <span>
                  <span className="dot" style={{ background: '#22c55e' }} /> High
                </span>
                <span>
                  <span className="dot" style={{ background: '#facc15' }} /> Partial
                </span>
                <span>
                  <span className="dot" style={{ background: '#ef4444' }} /> Missing
                </span>
              </div>
            </div>
            <Heatmap skills={detail.skills} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailView;
