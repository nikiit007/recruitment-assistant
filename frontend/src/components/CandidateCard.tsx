import React from 'react';
import { CandidateProfile } from '../types';

type CandidateCardProps = {
  candidate: CandidateProfile;
  onSelect?: (candidate: CandidateProfile) => void;
};

const badgeColor = (level: CandidateProfile['skills'][number]['level']) => level;

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSelect }) => {
  return (
    <button className="candidate-card" onClick={() => onSelect?.(candidate)}>
      <div className="candidate-meta">
        <span className="candidate-name">{candidate.name}</span>
        <span className="candidate-role">{candidate.role}</span>
      </div>
      {candidate.summary && <p className="secondary-text" style={{ marginTop: 6 }}>{candidate.summary}</p>}
      {candidate.highlights && candidate.highlights.length > 0 && (
        <ul className="secondary-text" style={{ paddingLeft: 16, margin: '6px 0' }}>
          {candidate.highlights.slice(0, 2).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <div className="badges">
        {candidate.skills.slice(0, 6).map((skill) => (
          <span key={skill.name} className={`badge ${badgeColor(skill.level)}`} title={skill.evidence}>
            {skill.name}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="score-block">
            <span className="secondary-text">AI Match Score</span>
            <span className="score-number">{Math.round(candidate.matchScore)}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(candidate.matchScore, 100)}%` }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'right', minWidth: 120 }}>
          {candidate.explanation?.greenFlags && candidate.explanation.greenFlags.length > 0 && (
            <p className="flag-text green">✓ {candidate.explanation.greenFlags[0]}</p>
          )}
          {candidate.explanation?.redFlags && candidate.explanation.redFlags.length > 0 && (
            <p className="flag-text red">⚠ {candidate.explanation.redFlags[0]}</p>
          )}
        </div>
      </div>
    </button>
  );
};

export default CandidateCard;
