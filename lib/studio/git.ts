// Publishing from the studio: commit the studio's own files (content/projects, public/projects) and push.
// It runs git without a shell, with fixed arguments, and never touches any other path.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { StudioError } from './server';

const run = promisify(execFile);
const STUDIO_PATHS = ['content/projects', 'content/site', 'public/projects'];

async function git(args: string[], timeout = 20000): Promise<string> {
  try {
    const { stdout } = await run('git', args, {
      cwd: process.cwd(), timeout, maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, // never wait on a prompt
    });
    return stdout;
  } catch (e) {
    const err = e as { stderr?: string; message?: string };
    const msg = (err.stderr || err.message || 'git failed').toString().trim().split('\n').slice(0, 4).join(' ').slice(0, 300);
    throw new StudioError(500, 'git: ' + msg);
  }
}
const tryGit = async (args: string[]) => { try { return (await git(args)).trim(); } catch { return ''; } };

// One git operation at a time.
let chain: Promise<unknown> = Promise.resolve();
export function gitLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.catch(() => undefined);
  return next;
}

export interface Change { status: string; path: string }

// `git status --porcelain=v1 -z` -> [{status, path}]. Renames carry a second path field, which is skipped.
export function parsePorcelain(out: string): Change[] {
  const parts = out.split('\0').filter(Boolean);
  const changes: Change[] = [];
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i];
    const status = entry.slice(0, 2).trim() || '?';
    changes.push({ status: status === '??' ? 'A' : status[0], path: entry.slice(3) });
    if (entry[0] === 'R' || entry[0] === 'C') i++;
  }
  return changes;
}

export function parseGithub(url: string): { owner: string; repo: string } | null {
  const m = url.trim().match(/^(?:git@github\.com:|https:\/\/(?:[^@/]+@)?github\.com\/|ssh:\/\/git@github\.com\/)([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

export function validateMessage(m: unknown): string {
  if (typeof m !== 'string') throw new StudioError(400, 'Write a commit message');
  const msg = m.trim();
  if (!msg || msg.length > 120 || /[\u0000-\u001f\u007f]/.test(msg)) throw new StudioError(400, 'The commit message must be one line of at most 120 characters');
  return msg;
}

export interface PublishStatus {
  branch: string;
  defaultBranch: string;
  upstream: boolean;
  ahead: number;
  behind: number;
  changes: Change[];
  otherChanges: number; // changed files outside the studio's folders; not included in a publish
  github: { owner: string; repo: string } | null;
  compareUrl: string | null; // open a pull request into the default branch, when on another branch
}

export async function publishStatus(): Promise<PublishStatus> {
  const branch = (await tryGit(['rev-parse', '--abbrev-ref', 'HEAD'])) || 'HEAD';
  const upstreamRef = await tryGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  let ahead = 0, behind = 0;
  if (upstreamRef) {
    const [b, a] = (await tryGit(['rev-list', '--left-right', '--count', '@{u}...HEAD'])).split(/\s+/).map(Number);
    behind = b || 0; ahead = a || 0;
  }
  const mine = parsePorcelain(await git(['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...STUDIO_PATHS]));
  const all = parsePorcelain(await git(['status', '--porcelain=v1', '-z', '--untracked-files=all']));
  const defaultBranch = (await tryGit(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])).replace(/^origin\//, '') || 'main';
  const github = parseGithub(await tryGit(['remote', 'get-url', 'origin']));
  const compareUrl = github && branch !== 'HEAD' && branch !== defaultBranch
    ? `https://github.com/${github.owner}/${github.repo}/compare/${encodeURIComponent(defaultBranch)}...${encodeURIComponent(branch)}?expand=1`
    : null;
  return { branch, defaultBranch, upstream: !!upstreamRef, ahead, behind, changes: mine, otherChanges: all.length - mine.length, github, compareUrl };
}

export async function publish(message: string): Promise<{ committed: boolean; sha: string; status: PublishStatus }> {
  const before = await publishStatus();
  if (before.branch === 'HEAD') throw new StudioError(409, 'Git is on a detached HEAD. Switch to a branch first.');
  if (before.behind > 0) throw new StudioError(409, `Your branch is ${before.behind} commit${before.behind === 1 ? '' : 's'} behind origin. Run git pull first.`);
  if (!before.changes.length && !before.ahead) throw new StudioError(409, 'Nothing to publish.');
  let committed = false;
  if (before.changes.length) {
    // only the studio folders that changed (git refuses a pathspec that matches nothing), whatever else is staged
    const paths = STUDIO_PATHS.filter((p) => before.changes.some((c) => c.path.startsWith(p + '/')));
    await git(['add', '-A', '--', ...paths]);
    await git(['commit', '-m', message, '--', ...paths], 60000);
    committed = true;
  }
  await git(before.upstream ? ['push'] : ['push', '-u', 'origin', before.branch], 90000);
  const sha = await tryGit(['rev-parse', '--short', 'HEAD']);
  return { committed, sha, status: await publishStatus() };
}
