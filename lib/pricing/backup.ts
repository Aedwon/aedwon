// Backup for the private pricing repo: commit everything in it and push. Uses the studio's git runner
// (no shell, fixed arguments) with the pricing folder as the working folder.
import { StudioError } from '@/lib/studio/server';
import { git, parsePorcelain } from '@/lib/studio/git';
import { assertPricingDir } from './store';

export interface BackupStatus { branch: string; upstream: boolean; ahead: number; behind: number; changes: number; lastBackup: string | null }

const quiet = async (args: string[], cwd: string) => { try { return (await git(args, 20000, cwd)).trim(); } catch { return ''; } };

async function statusIn(cwd: string): Promise<BackupStatus> {
  const branch = (await quiet(['rev-parse', '--abbrev-ref', 'HEAD'], cwd)) || 'HEAD';
  const upstream = !!(await quiet(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd));
  let ahead = 0, behind = 0;
  if (upstream) {
    const [b, a] = (await quiet(['rev-list', '--left-right', '--count', '@{u}...HEAD'], cwd)).split(/\s+/).map(Number);
    behind = b || 0; ahead = a || 0;
  }
  const changes = parsePorcelain(await git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], 20000, cwd)).length;
  const lastBackup = (await quiet(['log', '-1', '--format=%cI'], cwd)) || null;
  return { branch, upstream, ahead, behind, changes, lastBackup };
}

export async function backupStatus(): Promise<BackupStatus> {
  return statusIn(await assertPricingDir());
}

export async function backup(): Promise<{ committed: boolean; sha: string; status: BackupStatus }> {
  const cwd = await assertPricingDir();
  await quiet(['fetch', '--quiet'], cwd); // to see whether another machine pushed first
  const before = await statusIn(cwd);
  if (before.branch === 'HEAD') throw new StudioError(409, 'The pricing repo is on a detached HEAD. Switch to a branch first.');
  if (before.behind > 0) throw new StudioError(409, `The pricing repo is ${before.behind} commit${before.behind === 1 ? '' : 's'} behind origin. Run git pull in it first.`);
  if (!before.changes && !before.ahead) throw new StudioError(409, 'Nothing to back up.');
  let committed = false;
  if (before.changes) {
    await git(['add', '-A'], 20000, cwd);
    await git(['commit', '-m', `backup: ${new Date().toISOString()}`], 60000, cwd);
    committed = true;
  }
  await git(before.upstream ? ['push'] : ['push', '-u', 'origin', before.branch], 90000, cwd);
  const sha = await quiet(['rev-parse', '--short', 'HEAD'], cwd);
  return { committed, sha, status: await statusIn(cwd) };
}
