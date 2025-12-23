import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { CandidateProfile } from '../types';

type DiversitySankeyProps = {
  candidates: CandidateProfile[];
};

type FunnelGroup = {
  label: string;
  applicants: number;
  screened: number;
  shortlisted: number;
  dropOffRate: number;
};

type SankeyDatum = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

const genders = ['Female', 'Male', 'Non-binary', 'Not disclosed'];
const ethnicities = ['Black', 'Latinx', 'Asian', 'White', 'Indigenous', 'Mixed / Other'];

const withMockDemographics = (candidates: CandidateProfile[]) =>
  candidates.map((candidate) => {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
    const screened = Math.random() > 0.2;
    const shortlisted = screened && Math.random() > 0.5;

    return {
      ...candidate,
      demographics: { gender, ethnicity },
      pipeline: { screened, shortlisted },
    };
  });

const buildGroups = (augmented: ReturnType<typeof withMockDemographics>): FunnelGroup[] => {
  const groups = new Map<string, FunnelGroup>();

  augmented.forEach((candidate) => {
    const label = `${candidate.demographics?.gender ?? 'Unspecified'} | ${candidate.demographics?.ethnicity ?? 'Unspecified'}`;
    const entry = groups.get(label) ?? {
      label,
      applicants: 0,
      screened: 0,
      shortlisted: 0,
      dropOffRate: 0,
    };

    entry.applicants += 1;
    if (candidate.pipeline?.screened) entry.screened += 1;
    if (candidate.pipeline?.shortlisted) entry.shortlisted += 1;

    entry.dropOffRate = entry.applicants > 0 ? 1 - entry.shortlisted / entry.applicants : 0;
    groups.set(label, entry);
  });

  return Array.from(groups.values());
};

const createSankeyData = (groups: FunnelGroup[]): SankeyDatum => {
  const baseNodes = ['Applicants'];
  const stageNames = ['Applicants', 'AI Screened', 'Shortlisted'] as const;
  const nodeNames = new Set<string>(baseNodes);

  groups.forEach((group) => {
    stageNames.forEach((stage) => nodeNames.add(`${group.label} – ${stage}`));
  });

  const nodes = Array.from(nodeNames).map((name) => ({ name }));
  const nodeIndex = new Map(nodes.map((node, idx) => [node.name, idx]));

  const links = groups.flatMap((group) => {
    const applicantsNode = `${group.label} – Applicants`;
    const screenedNode = `${group.label} – AI Screened`;
    const shortlistedNode = `${group.label} – Shortlisted`;

    return [
      {
        source: nodeIndex.get('Applicants') ?? 0,
        target: nodeIndex.get(applicantsNode) ?? 0,
        value: group.applicants,
      },
      {
        source: nodeIndex.get(applicantsNode) ?? 0,
        target: nodeIndex.get(screenedNode) ?? 0,
        value: group.screened,
      },
      {
        source: nodeIndex.get(screenedNode) ?? 0,
        target: nodeIndex.get(shortlistedNode) ?? 0,
        value: group.shortlisted,
      },
    ].filter((link) => link.value > 0);
  });

  return { nodes, links };
};

const SankeyTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0];

  return (
    <div style={{ background: '#fff', boxShadow: '0 10px 30px rgba(15,23,42,0.1)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{datum.payload.source?.name} → {datum.payload.target?.name}</p>
      <p style={{ margin: '2px 0 0', color: '#475569' }}>{datum.value} candidates</p>
    </div>
  );
};

const DiversitySankey: React.FC<DiversitySankeyProps> = ({ candidates }) => {
  const { sankeyData, groups, warnings } = useMemo(() => {
    const augmented = withMockDemographics(candidates);
    const funnelGroups = buildGroups(augmented);
    const sankey = createSankeyData(funnelGroups);
    const warningGroups = funnelGroups.filter((group) => group.dropOffRate > 0.2);

    return { sankeyData: sankey, groups: funnelGroups, warnings: warningGroups };
  }, [candidates]);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="card-header" style={{ padding: 0 }}>
        <h3 className="card-title" style={{ margin: 0 }}>Bias & Diversity Funnel</h3>
        <p className="secondary-text" style={{ margin: 0 }}>Monitor demographic flow across the pipeline.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {warnings.length > 0 && (
          <div className="warning-banner">
            <span aria-hidden>⚡</span>
            <span>Potential Disparate Impact Detected</span>
          </div>
        )}
      </div>

      <div style={{ height: 320, width: '100%', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey data={sankeyData} nodePadding={18} margin={{ left: 20, right: 20, top: 10, bottom: 10 }} linkCurvature={0.5}>
            <Tooltip content={<SankeyTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      <div className="heatmap-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {groups.map((group) => (
          <div key={group.label} className="heatmap-item" style={{ background: '#fff' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{group.label}</div>
              <p className="secondary-text" style={{ margin: '4px 0' }}>
                Applicants → Screened → Shortlisted
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 14 }}>
                <span>Applicants</span>
                <strong style={{ textAlign: 'right' }}>{group.applicants}</strong>
                <span>AI Screened</span>
                <strong style={{ textAlign: 'right' }}>{group.screened}</strong>
                <span>Shortlisted</span>
                <strong style={{ textAlign: 'right' }}>{group.shortlisted}</strong>
              </div>
              <div style={{ marginTop: 6, fontWeight: 700, color: group.dropOffRate > 0.2 ? '#92400e' : '#166534' }}>
                Drop-off: {Math.round(group.dropOffRate * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiversitySankey;
