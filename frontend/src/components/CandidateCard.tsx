import React from 'react';
import { CandidateProfile } from '../types';

type CandidateCardProps = {
  candidate: CandidateProfile;
  onSelect?: (candidate: CandidateProfile) => void;
};

const badgeColor = (level: CandidateProfile['skills'][number]['level']) => {
  switch (level) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-red-100 text-red-800 border-red-200';
  }
};

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSelect }) => {
  return (
    <button
      className="w-full text-left bg-white rounded-xl shadow hover:shadow-lg transition p-4 border border-slate-200"
      onClick={() => onSelect?.(candidate)}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{candidate.name}</h3>
            <span className="text-sm text-slate-500">{candidate.role}</span>
          </div>
          {candidate.summary && (
            <p className="text-sm text-slate-600 line-clamp-2">{candidate.summary}</p>
          )}
          {candidate.highlights && candidate.highlights.length > 0 && (
            <ul className="text-xs text-slate-500 list-disc list-inside">
              {candidate.highlights.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {candidate.skills.slice(0, 6).map((skill) => (
              <span
                key={skill.name}
                className={`text-xs font-medium px-2 py-1 rounded-full border ${badgeColor(skill.level)}`}
                title={skill.evidence}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          <div className="flex items-center gap-1 text-slate-500 text-xs">AI Match Score</div>
          <div className="text-3xl font-bold text-slate-900">{Math.round(candidate.matchScore)}</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(candidate.matchScore, 100)}%` }}
            />
          </div>
          {candidate.explanation?.greenFlags && candidate.explanation.greenFlags.length > 0 && (
            <p className="text-xs text-green-700 text-right line-clamp-2">
              ✓ {candidate.explanation.greenFlags[0]}
            </p>
          )}
          {candidate.explanation?.redFlags && candidate.explanation.redFlags.length > 0 && (
            <p className="text-xs text-red-600 text-right line-clamp-2">
              ⚠ {candidate.explanation.redFlags[0]}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default CandidateCard;
