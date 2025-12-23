import React from 'react';
import { SkillSignal } from '../types';

type HeatmapProps = {
  skills: SkillSignal[];
};

const colorForLevel = (level: SkillSignal['level']) => {
  switch (level) {
    case 'high':
      return '#22c55e';
    case 'medium':
      return '#facc15';
    default:
      return '#ef4444';
  }
};

export const Heatmap: React.FC<HeatmapProps> = ({ skills }) => {
  return (
    <div className="heatmap-grid">
      {skills.map((skill) => (
        <div key={skill.name} className="heatmap-item">
          <div className="dot" style={{ background: colorForLevel(skill.level) }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{skill.name}</p>
            {skill.evidence && <p className="secondary-text" style={{ margin: 0 }}>{skill.evidence}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
