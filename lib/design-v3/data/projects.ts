// The project content lives in content/projects/<id>.json, one file per project, in the order of
// content/projects/index.ts. Edit those files by hand, or use the local studio (see lib/studio):
// open any project page under `next dev` on localhost and press Edit.
//
// Field names, ordering and placeholder brackets were ported verbatim from
// v3-design/reference/generators/projects.py, so the files still carry that shape.

import { PROJECT_FILES } from '@/content/projects';

// An image saved by the studio into public/projects/<id>/. w and h are its pixel size.
export interface Img {
  src: string;
  alt?: string;
  caption?: string;
  w?: number;
  h?: number;
  // which part of the picture stays in view when it is cropped to a frame, in percent (50, 50 is the middle)
  focus?: { x: number; y: number };
}

export interface Project {
  id: string;
  name: string;
  type: string;
  media: string;
  depth: string;
  desc: string;
  stack: string[];
  stackText?: string;
  repo?: string;
  post?: boolean;
  topic?: string;
  mins?: string;
  date?: string;
  links: { label: string; href: string }[];
  facts: { k: string; v: string }[];
  points?: { h: string; p: string }[];
  sections?: Section[];
  // a real picture for the hero stage, in place of the drawn mockup
  hero?: Img;
  // the two detail tiles on a note (null keeps the empty tile)
  shots?: (Img | null)[];
}

export interface Section {
  kind: string;
  h?: string;
  p?: string[];
  items?: { h: string; p: string[]; which: string; vh: string }[];
  cols?: { h: string; items: string[] }[];
  fig?: string;
  // a real picture for the figure, in place of the dashed placeholder
  img?: Img;
  [k: string]: unknown;
}

export const PROJECTS: Project[] = PROJECT_FILES as unknown as Project[];

export const KINDS = ["text","systems","status"];
