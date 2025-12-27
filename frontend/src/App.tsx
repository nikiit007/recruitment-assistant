import React from 'react';
import CandidateCard from './components/CandidateCard';
import DiversitySankey from './components/DiversitySankey';
import MatchDetailView from './components/MatchDetailView';
import { CandidateProfile, MatchDetail, SkillSignal } from './types';

type SearchResult = {
  text: string;
  score: number;
};

type MatchResponse = {
  matchScore: number;
  chainOfThought: string;
  greenFlags: string[];
  redFlags: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const MAX_MATCH_TEXT = 4000;
const MAX_DISPLAY_TEXT = 1000;

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const pickValue = (source: Record<string, unknown>, keys: string[]) => {
  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = normalizeKey(key);
    if (keys.some((item) => item === normalizedKey)) {
      return value;
    }
  }
  return undefined;
};

const asStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
};

const parseMatchResponse = (payload: Record<string, unknown>): MatchResponse => {
  const scoreValue = pickValue(payload, ['matchscore', 'score', 'match']);
  const chainValue = pickValue(payload, ['chainofthought', 'explanation', 'analysis']);
  const greenValue = pickValue(payload, ['greenflags', 'strengths', 'pros']);
  const redValue = pickValue(payload, ['redflags', 'gaps', 'cons']);

  const matchScore = Number(scoreValue);

  return {
    matchScore: Number.isFinite(matchScore) ? matchScore : 0,
    chainOfThought: typeof chainValue === 'string' ? chainValue : '',
    greenFlags: asStringArray(greenValue),
    redFlags: asStringArray(redValue),
  };
};

const cleanWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3))}...`;
};

const candidateNameFromFile = (filename: string) =>
  filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();

const labelFromFlag = (flag: string) => {
  const trimmed = flag.replace(/["']/g, '').trim();
  if (trimmed.length <= 24) return trimmed;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return `${trimmed.slice(0, 21)}...`;
  return `${words.slice(0, 4).join(' ')}...`;
};

const buildSkillSignals = (greenFlags: string[], redFlags: string[]): SkillSignal[] => {
  const skills: SkillSignal[] = [];
  const seen = new Set<string>();

  const addSkill = (flag: string, level: SkillSignal['level']) => {
    if (!flag) return;
    const label = labelFromFlag(flag);
    if (!label || seen.has(label)) return;
    seen.add(label);
    skills.push({ name: label, level, evidence: flag });
  };

  greenFlags.slice(0, 5).forEach((flag) => addSkill(flag, 'high'));
  redFlags.slice(0, 3).forEach((flag) => addSkill(flag, 'low'));

  return skills;
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json();
};

const extractText = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const data = await fetchJson(`${API_BASE_URL}/extract-text`, {
    method: 'POST',
    body: formData,
  });
  return typeof data.text === 'string' ? data.text : '';
};

const ingestResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const data = await fetchJson(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    body: formData,
  });
  return typeof data.chunks === 'number' ? data.chunks : 0;
};

const runMatch = async (jobDescription: string, resumeText: string) => {
  const payload = {
    candidate_profile: resumeText,
    job_description: jobDescription,
  };

  return fetchJson(`${API_BASE_URL}/api/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

const searchMatches = async (jobDescription: string): Promise<SearchResult[]> => {
  const payload = { job_description: jobDescription };
  const data = await fetchJson(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return Array.isArray(data.results) ? data.results : [];
};

function App() {
  const [jobDescription, setJobDescription] = React.useState('');
  const [jobFileName, setJobFileName] = React.useState('');
  const [resumeFiles, setResumeFiles] = React.useState<File[]>([]);
  const [candidates, setCandidates] = React.useState<CandidateProfile[]>([]);
  const [candidateDetails, setCandidateDetails] = React.useState<Record<string, MatchDetail>>({});
  const [activeCandidateId, setActiveCandidateId] = React.useState<string | null>(null);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [chunkCount, setChunkCount] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [lastRunAt, setLastRunAt] = React.useState('');

  const activeCandidate = candidates.find((candidate) => candidate.id === activeCandidateId) ?? null;
  const activeDetail = activeCandidate ? candidateDetails[activeCandidate.id] : null;
  const topScore = candidates.length > 0 ? Math.max(...candidates.map((candidate) => candidate.matchScore)) : 0;

  const handleJobFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    setStatusMessage(`Extracting job description from ${file.name}...`);
    setJobFileName(file.name);

    try {
      const text = await extractText(file);
      setJobDescription(cleanWhitespace(text));
      setStatusMessage(`Loaded job description from ${file.name}.`);
    } catch (error) {
      setErrorMessage('Could not extract text from the job description PDF.');
      setStatusMessage('');
    }
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setResumeFiles(files);
  };

  const runAnalysis = async () => {
    setErrorMessage('');

    if (!jobDescription.trim()) {
      setErrorMessage('Add a job description or load the PDF first.');
      return;
    }

    if (resumeFiles.length === 0) {
      setErrorMessage('Select at least one resume PDF.');
      return;
    }

    setIsRunning(true);
    setStatusMessage('Preparing analysis...');
    setSearchResults([]);
    setChunkCount(0);

    const normalizedJob = cleanWhitespace(jobDescription);
    const trimmedJob = truncateText(normalizedJob, MAX_MATCH_TEXT);

    const newCandidates: CandidateProfile[] = [];
    const newDetails: Record<string, MatchDetail> = {};
    let totalChunks = 0;

    try {
      for (const [index, file] of resumeFiles.entries()) {
        setStatusMessage(`Processing ${file.name} (${index + 1}/${resumeFiles.length})...`);

        const [resumeText, chunks] = await Promise.all([
          extractText(file),
          ingestResume(file),
        ]);
        totalChunks += chunks;

        const normalizedResume = cleanWhitespace(resumeText);
        const matchPayload = truncateText(normalizedResume, MAX_MATCH_TEXT);
        const matchData = await runMatch(trimmedJob, matchPayload);
        const match = parseMatchResponse(matchData as Record<string, unknown>);

        const candidateName = candidateNameFromFile(file.name) || `Candidate ${index + 1}`;
        const candidateId = `${candidateName}-${index}-${Date.now()}`;
        const summary = truncateText(normalizedResume, 180);
        const highlights = match.greenFlags.slice(0, 2);
        const skills = buildSkillSignals(match.greenFlags, match.redFlags);
        const explanationText = match.chainOfThought || 'No explanation returned.';

        newCandidates.push({
          id: candidateId,
          name: candidateName,
          role: 'Candidate',
          matchScore: match.matchScore,
          skills,
          summary: summary || 'Resume parsed successfully.',
          highlights,
          explanation: {
            chainOfThought: explanationText,
            greenFlags: match.greenFlags,
            redFlags: match.redFlags,
          },
        });

        newDetails[candidateId] = {
          jobDescription: trimmedJob,
          resumeText: truncateText(normalizedResume, MAX_DISPLAY_TEXT),
          explanation: {
            matchScore: match.matchScore,
            chainOfThought: explanationText,
            greenFlags: match.greenFlags,
            redFlags: match.redFlags,
          },
          skills,
        };
      }

      const sortedCandidates = [...newCandidates].sort((a, b) => b.matchScore - a.matchScore);
      setCandidates(sortedCandidates);
      setCandidateDetails(newDetails);
      setActiveCandidateId(sortedCandidates[0]?.id ?? null);

      const results = await searchMatches(trimmedJob);
      setSearchResults(results.slice(0, 5));
      setChunkCount(totalChunks);

      setStatusMessage(`Done. ${sortedCandidates.length} resumes analyzed, ${totalChunks} chunks ingested.`);
      setLastRunAt(new Date().toLocaleTimeString());
    } catch (error) {
      setErrorMessage('Analysis failed. Check the backend server and try again.');
      setStatusMessage('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <div className="eyebrow">Recruitment Assistant</div>
          <h1>Run real resume matches in minutes</h1>
          <p>
            Upload a job description and resume PDFs to score candidates with transparent AI reasoning.
          </p>
          <div className="pill-row">
            <span className="pill">Milvus-powered search</span>
            <span className="pill">LLM match scoring</span>
            <span className="pill">Explainable output</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-metric">
            <small>Top candidate score</small>
            <strong>{candidates.length > 0 ? Math.round(topScore) : '--'}</strong>
            <span>{candidates.length > 0 ? 'Best match from current run' : 'Awaiting analysis'}</span>
          </div>
          <div className="hero-card">
            <small>Resumes analyzed</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>{candidates.length}</strong>
            <span className="secondary-text">Upload new files to refresh</span>
          </div>
          <div className="hero-card">
            <small>Milvus chunks</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>{chunkCount}</strong>
            <span className="secondary-text">Total chunks ingested</span>
          </div>
          <div className="hero-card">
            <small>Last run</small>
            <strong style={{ fontSize: '22px', color: '#0f172a' }}>{lastRunAt || '--'}</strong>
            <span className="secondary-text">Local backend at {API_BASE_URL}</span>
          </div>
        </div>
      </header>

      <div className="section-shell">
        <section className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow" style={{ color: '#0ea5e9' }}>
                Inputs
              </p>
              <h2 className="card-title">Upload job description and resumes</h2>
              <p className="secondary-text">Use files from `sample_jd` and `sample_resumes` to test.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="job-pdf">Job description PDF</label>
              <input
                id="job-pdf"
                type="file"
                accept="application/pdf"
                onChange={handleJobFileChange}
                className="input"
              />
              {jobFileName && <span className="secondary-text">Loaded: {jobFileName}</span>}
              <label htmlFor="job-text">Job description text</label>
              <textarea
                id="job-text"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste a job description or load the PDF above."
                className="textarea"
                rows={6}
              />
            </div>
            <div className="form-field">
              <label htmlFor="resume-pdf">Resume PDFs</label>
              <input
                id="resume-pdf"
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleResumeFileChange}
                className="input"
              />
              {resumeFiles.length > 0 ? (
                <ul className="upload-list">
                  {resumeFiles.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              ) : (
                <span className="secondary-text">No resumes selected yet.</span>
              )}
            </div>
          </div>

          <div className="action-row">
            <button className="button primary" onClick={runAnalysis} disabled={isRunning}>
              {isRunning ? 'Running analysis...' : 'Run analysis'}
            </button>
            {statusMessage && <div className="status-banner">{statusMessage}</div>}
            {errorMessage && <div className="status-banner error">{errorMessage}</div>}
          </div>
        </section>

        <div className="page-grid">
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow" style={{ color: '#4f46e5' }}>
                  Shortlist
                </p>
                <h2 className="card-title">Best next conversations</h2>
                <p className="secondary-text">Ranked by match score for the active requisition.</p>
              </div>
            </div>
            <div className="candidate-list">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onSelect={(selected) => setActiveCandidateId(selected.id)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  Upload a job description and resume PDFs, then run analysis to see matches.
                </div>
              )}
            </div>
          </section>

          <section className="card detail-shell">
            {activeCandidate && activeDetail ? (
              <MatchDetailView candidate={activeCandidate} detail={activeDetail} />
            ) : (
              <div className="empty-state">Select a candidate to view match details.</div>
            )}
          </section>
        </div>

        <section className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow" style={{ color: '#0ea5e9' }}>
                Milvus Search
              </p>
              <h2 className="card-title">Semantic retrieval results</h2>
              <p className="secondary-text">Top chunks matched against the job description.</p>
            </div>
          </div>
          {searchResults.length > 0 ? (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div key={`${result.score}-${index}`} className="search-card">
                  <div className="search-score">Score: {result.score.toFixed(3)}</div>
                  <p className="secondary-text">{result.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Run analysis to see semantic search results.</div>
          )}
        </section>

        {candidates.length > 0 && (
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow" style={{ color: '#0ea5e9' }}>
                  Safety Layer
                </p>
                <h2 className="card-title">Bias & diversity funnel</h2>
                <p className="secondary-text">Synthetic demographics for demo visualization only.</p>
              </div>
            </div>
            <DiversitySankey candidates={candidates.slice(0, 6)} />
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
