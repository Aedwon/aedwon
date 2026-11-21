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
  /** Id of the part this node opens. Nodes without one are plain boxes. */
  part?: string;
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
  picture: { nodes: OrgNode[]; edges: OrgEdge[] };
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
  mindset: { title: string; paragraphs: string[] };
  treatment: { title: string; paragraphs: string[] };
  setup: SetupContent;
  task: TaskContent;
  paste: { title: string; paragraphs: string[]; head: string[]; rows: string[][] };
  beforeAfter: {
    title: string;
    paragraphs: string[];
    items: { type: "quote" | "reply"; text: string }[];
  };
  oneTask: { title: string; paragraphs: string[]; steps: LeadItem[] };
  rulesGrew: { title: string; items: LeadItem[] };
}
