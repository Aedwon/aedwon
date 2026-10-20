// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { backup, backupStatus } from '../backup';
import { StudioError } from '@/lib/studio/server';

let root: string, remote: string, work: string;
const sh = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const status = async (p: Promise<unknown>) => { try { await p; return 200; } catch (e) { return e instanceof StudioError ? e.status : String(e); } };

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-git-'));
  remote = path.join(root, 'remote.git');
  work = path.join(root, 'work');
  for (const [k, v] of Object.entries({ GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' })) vi.stubEnv(k, v);
  sh(root, 'init', '--bare', '-b', 'main', remote);
  sh(root, 'clone', remote, work);
  sh(work, 'symbolic-ref', 'HEAD', 'refs/heads/main'); // an empty clone's branch name depends on git config
  await fs.writeFile(path.join(work, 'README.md'), 'x\n');
  sh(work, 'add', '-A'); sh(work, 'commit', '-m', 'init'); sh(work, 'push', '-u', 'origin', 'HEAD');
  vi.stubEnv('PRICING_DIR', work);
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(root, { recursive: true, force: true }); });

describe('backup', () => {
  it('commits every change in the pricing folder and pushes it', async () => {
    await fs.writeFile(path.join(work, 'settings.json'), '{}\n');
    expect((await backupStatus()).changes).toBe(1);
    const r = await backup();
    expect(r.committed).toBe(true);
    expect(r.status.changes).toBe(0);
    expect(sh(remote, 'log', '-1', '--format=%s')).toMatch(/^backup: \d{4}-\d{2}-\d{2}T/);
    expect(r.status.lastBackup).not.toBeNull();
  });
  it('refuses when there is nothing to back up', async () => {
    expect(await status(backup())).toBe(409);
  });
  it('refuses when the branch is behind origin', async () => {
    const other = path.join(root, 'other');
    sh(root, 'clone', remote, other);
    await fs.writeFile(path.join(other, 'b.txt'), 'b\n');
    sh(other, 'add', '-A'); sh(other, 'commit', '-m', 'b'); sh(other, 'push');
    await fs.writeFile(path.join(work, 'a.txt'), 'a\n');
    expect(await status(backup())).toBe(409);
  });
});
