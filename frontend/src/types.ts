export type SkillSignal = {
  name: string;
  level: 'high' | 'medium' | 'low';
  evidence?: string;
};

export type CandidateProfile = {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  yearsExperience?: number;
  location?: string;
  skills: SkillSignal[];
  summary?: string;
  highlights?: string[];
  explanation?: {
    chainOfThought: string;
    greenFlags: string[];
    redFlags: string[];
  };
  demographics?: {
    gender: string;
    ethnicity: string;
  };
};

export type MatchDetail = {
  jobDescription: string;
  resumeText: string;
  explanation: {
    matchScore: number;
    chainOfThought: string;
    greenFlags: string[];
    redFlags: string[];
  };
  skills: SkillSignal[];
};
