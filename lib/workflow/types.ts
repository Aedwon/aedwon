export interface WorkflowPart {
  id: string;
  title: string;
  paragraphs: string[];
  /** Short lines shown after the paragraphs (the org chart's model list). */
  lines?: string[];
  prompt?: string;
}

export interface OrgNode {
  id: string;
  label: string;
  sub?: string;
  /** Id of the section this box links to. */
  to: string;
  /** Sits outside the chain. */
  outside?: boolean;
  /** [column, row] on the wide layout, 1-based. */
  grid: [number, number];
}

export type EdgeEnds = "to" | "both";

export interface OrgEdge {
  from: string;
  to: string;
  kind: string;
  ends: EdgeEnds;
  optional?: boolean;
}

export interface PartGroupContent {
  label: string;
  parts: WorkflowPart[];
}

export interface SetupContent extends PartGroupContent {
  picture: { nodes: OrgNode[]; edges: OrgEdge[]; /** Setup parts drawn as boxes with no connections. */ extras: string[] };
}

export interface TaskContent extends PartGroupContent {
  picture: {
    /** Part ids in the order work happens. */
    line: string[];
    /** Parts that sit outside the line. */
    optional: { id: string; sub: string }[];
  };
}

export interface LeadItem {
  lead: string;
  text: string;
  quote?: string;
}

export interface WorkflowPage {
  title: string;
  line: string;
  snapshot: { text: string; iso: string };
  copyAll: string;
  mindset: { id: string; title: string; paragraphs: string[] };
  treatment: { id: string; title: string; paragraphs: string[] };
  setup: SetupContent;
  task: TaskContent;
  paste: { id: string; title: string; paragraphs: string[]; head: string[]; rows: string[][] };
  beforeAfter: {
    id: string;
    title: string;
    paragraphs: string[];
    items: { type: "quote" | "reply"; text: string }[];
  };
  oneTask: { id: string; title: string; paragraphs: string[]; steps: LeadItem[] };
  rulesGrew: { id: string; title: string; items: LeadItem[] };
}
