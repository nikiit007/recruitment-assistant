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
    <div className="bg-white shadow-lg border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">{datum.payload.source?.name} → {datum.payload.target?.name}</p>
      <p>{datum.value} candidates</p>
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
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Safety Layer</p>
          <h3 className="text-xl font-semibold text-slate-900">Bias & Diversity Funnel</h3>
          <p className="text-sm text-slate-600">Mock demographic tags applied for demonstration only.</p>
        </div>
        {warnings.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg">
            <span className="text-lg">⚠️</span>
            <div className="text-sm font-medium">Potential Disparate Impact Detected</div>
          </div>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodePadding={18}
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
            linkCurvature={0.5}
          >
            <Tooltip content={<SankeyTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group) => (
          <div key={group.label} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">{group.label}</div>
            <div className="text-xs text-slate-500 mb-2">Applicants → Screened → Shortlisted</div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Applicants</span>
              <span className="font-semibold">{group.applicants}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>AI Screened</span>
              <span className="font-semibold">{group.screened}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Shortlisted</span>
              <span className="font-semibold">{group.shortlisted}</span>
            </div>
            <div
              className={`mt-2 text-xs font-medium ${
                group.dropOffRate > 0.2 ? 'text-amber-700' : 'text-green-700'
              }`}
            >
              Drop-off: {Math.round(group.dropOffRate * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiversitySankey;
