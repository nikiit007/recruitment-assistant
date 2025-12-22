import React from 'react';
import { SkillSignal } from '../types';

type HeatmapProps = {
  skills: SkillSignal[];
};

const colorForLevel = (level: SkillSignal['level']) => {
  switch (level) {
    case 'high':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-400';
    default:
      return 'bg-red-500';
  }
};

export const Heatmap: React.FC<HeatmapProps> = ({ skills }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {skills.map((skill) => (
        <div key={skill.name} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
          <div className={`w-3 h-3 rounded-full ${colorForLevel(skill.level)}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{skill.name}</p>
            {skill.evidence && <p className="text-[11px] text-slate-500">{skill.evidence}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
