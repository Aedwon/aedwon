// Types for the discovery and pricing tool. Question wording lives in questions.ts (public). Every number
// lives in the private pricing repo's settings.json, keyed by answerKey(question, choice).
export type WorkType = 'website' | 'webtool' | 'bot';
export const WORK_TYPES: WorkType[] = ['website', 'webtool', 'bot'];

export type Currency = 'PHP' | 'USD';
export const CURRENCIES: Currency[] = ['PHP', 'USD'];

export type CallStatus = 'open' | 'sent' | 'won' | 'lost';
export const CALL_STATUSES: CallStatus[] = ['open', 'sent', 'won', 'lost'];

export type SectionId = 'problem' | 'people' | 'scope' | 'features' | 'data' | 'integrations' | 'hosting' | 'timing' | 'budget';

export interface Choice { id: string; label: string; none?: boolean } // none: "no" answer, never a recap line
export interface Question {
  id: string;
  section: SectionId;
  types: WorkType[] | 'all';
  prompt: string;
  hint?: string;
  multi?: boolean;
  feature?: string; // recap label when this is a feature question
  choices: Choice[];
}
export interface Section { id: SectionId; title: string; questions: Question[] }

export interface AnswerPrice {
  low?: number; // standard-effort hours
  high?: number;
  risk?: number; // percent added to the high end
  rush?: boolean; // multiplies both ends by rushMultiplier
  hosting?: Record<Currency, number>; // monthly hosting cost
  changeHours?: number; // expected upkeep hours per month
  estimate?: boolean; // starter value, not yet edited
}

export interface Settings {
  version: 1;
  rates: Record<Currency, number | null>;
  upkeepRates: Record<Currency, number | null>;
  base: { low: number; high: number };
  upkeepBaseHours: number;
  rushMultiplier: number;
  rounding: Record<Currency, number>;
  answers: Record<string, AnswerPrice>;
}

export interface RecapEdits { heard?: string; build?: string[]; later?: string[]; next?: string }

export interface Call {
  version: 1;
  id: string;
  client: string;
  company: string;
  date: string; // YYYY-MM-DD
  currency: Currency;
  types: WorkType[];
  answers: Record<string, string[]>; // question id -> choice ids
  notes: Partial<Record<SectionId, string>>;
  words: string; // the client's problem in their own words
  scope: Record<string, 'included' | 'later'>; // feature question id -> scope
  nextSteps: string;
  upkeep: boolean;
  status: CallStatus;
  realHours: number | null;
  recapEdits: RecapEdits;
}

export interface Driver { key: string; question: string; choice: string; high: number }
export interface RiskHit { key: string; question: string; choice: string; percent: number }

export interface Estimate {
  hours: { low: number; high: number };
  price: { low: number; high: number } | null; // null until a rate is set
  monthly: number | null;
  missingRate: boolean;
  missingUpkeepRate: boolean;
  drivers: Driver[]; // top 3 by high hours
  risks: RiskHit[];
  rush: boolean;
  unanswered: number;
  unpriced: string[]; // answered keys with no settings entry
}

export interface Recap { client: string; company: string; date: string; heard: string; build: string[]; later: string[]; next: string }

export interface CallSummary {
  id: string; client: string; company: string; date: string; currency: Currency; types: WorkType[];
  status: CallStatus; hours: { low: number; high: number }; price: { low: number; high: number } | null; realHours: number | null;
}
