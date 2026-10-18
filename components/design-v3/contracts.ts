// Shared contracts between the Room host and its children.
// The prototype sends commands as "value#counter" strings; here a Req object
// carries the same value plus a nonce so repeated commands still fire.

export interface Req {
  v: string;
  n: number;
}

export interface WallIndex2Handle {
  viewReq(req: Req): void;
  setDim(dim: number): void;
  // where project i's picture is on screen right now (client pixels), or null if it isn't showing
  rectOf(i: number): { left: number; top: number; width: number; height: number } | null;
}

export interface AboutVolumesHandle {
  openReq(req: Req): void;
  closeReq(req: Req): void;
}

export interface ProjectSpreadHandle {
  openReq(req: Req): void;
}
