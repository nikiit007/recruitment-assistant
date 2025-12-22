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
    <div className="relative bg-slate-50 min-h-[70vh] rounded-2xl shadow-inner overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Requisition</p>
          <h2 className="text-2xl font-bold text-slate-900">{candidate.role}</h2>
          <p className="text-sm text-slate-500">{candidate.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">AI Match Score</p>
            <p className="text-3xl font-bold text-indigo-600">{Math.round(detail.explanation.matchScore)}</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
        <div className="p-6 border-r border-slate-200 bg-white overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Job Description</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{detail.jobDescription}</p>
        </div>
        <div className="p-6 bg-white overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Candidate Resume</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{detail.resumeText}</p>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="max-w-3xl w-full mx-6 bg-white/90 backdrop-blur shadow-2xl rounded-2xl border border-indigo-100 p-6 pointer-events-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Glass Box Explanation</p>
              <h3 className="text-xl font-semibold text-slate-900">Why this candidate?</h3>
            </div>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Score: {Math.round(detail.explanation.matchScore)}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">{detail.explanation.chainOfThought}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Green Flags</h4>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                {detail.explanation.greenFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Red Flags</h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {detail.explanation.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900">Skill Heatmap</h4>
              <div className="flex gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Partial</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Missing</span>
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
