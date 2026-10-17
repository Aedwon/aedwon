// A tiny shared store for the local studio. Always bundled (it is small); `available` only ever
// becomes true on a localhost dev server, so in production every studio control renders as plain content.
import { useSyncExternalStore } from 'react';
import type { Op } from './actions';

// The calls to the studio API. Set only by the dev-only StudioUI, so the production bundle holds no save code.
export interface StudioApi {
  saveOp: (id: string, op: Op) => Promise<unknown>;
  uploadImage: (id: string, slot: string, file: File) => Promise<unknown>;
}

export interface StudioState {
  available: boolean;
  off: string; // why the studio is off on this localhost server, if it is
  api: StudioApi | null;
  editing: boolean;
  status: 'idle' | 'saving' | 'saved' | 'error';
  message: string;
  drawer: boolean;
}

const SERVER: StudioState = { available: false, off: '', api: null, editing: false, status: 'idle', message: '', drawer: false };
let state: StudioState = SERVER;
const subs = new Set<() => void>();

export const getStudio = () => state;
export function setStudio(patch: Partial<StudioState>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export function useStudio(): StudioState {
  return useSyncExternalStore(subscribe, getStudio, () => SERVER);
}
