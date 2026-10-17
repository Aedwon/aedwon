import type { BlogPost } from './blogs';

export const NEXT_MODEL_BLOG: BlogPost = {
  slug: 'the-next-model-wont-fix-your-specification',
  title: "The next model won't fix your specification",
  date: 'Sep 9, 2026',
  readTime: '7 min read',
  summary:
    'Better coding models are useful, but model capability can also hide weak task boundaries, missing project groundwork, and poor agent routing.',
  tags: ['Engineering', 'AI', 'Agents'],
  blocks: [
    {
      type: 'paragraph',
      text: `Better coding models keep making older ones look worse than they actually were.`,
    },
    {
      type: 'paragraph',
      text: `A new model comes out, handles larger changes, follows instructions more reliably, and gets stuck less often. A few months later, the model people were happily shipping software with starts getting described as if it can barely be trusted with a pull request.`,
    },
    {
      type: 'paragraph',
      text: `I find this a little strange. Developers were already shipping real software with earlier generations of these models. They did not suddenly lose the ability to write code when something better appeared.`,
    },
    {
      type: 'paragraph',
      text: `What changed was the amount of friction we were willing to tolerate around them.`,
    },
    {
      type: 'paragraph',
      text: `A sufficiently capable model can compensate for quite a lot. It can inspect an unfamiliar repository, infer conventions nobody documented, guess what an underspecified issue probably means, discover the relevant tests, and recover when its first approach turns out to be wrong. Newer models are getting much better at this.`,
    },
    {
      type: 'paragraph',
      text: `That is useful. It can also make a weak development process harder to notice.`,
    },

    {
      type: 'heading',
      id: 'what-the-model-is-reconstructing',
      text: 'What the model is reconstructing',
    },
    {
      type: 'paragraph',
      text: `Suppose an agent keeps failing an implementation task until you move it to a stronger model. There are at least two explanations.`,
    },
    {
      type: 'paragraph',
      text: `The obvious one is that the task is difficult and the first model was not capable enough. That happens. Some bugs require following state across several systems. Some architectural changes have enough interacting constraints that using the best reasoning model available is sensible.`,
    },
    {
      type: 'paragraph',
      text: `The other possibility is that the model is being asked to reconstruct information the project should already contain.`,
    },
    {
      type: 'paragraph',
      text: `Maybe the acceptance criteria are unclear. Maybe nobody wrote down which subsystem owns a piece of state. Maybe the repository has tests, but nothing tells the agent which ones establish correctness for this change. Maybe the issue says "fix authentication" and leaves the model to determine what that means.`,
    },
    {
      type: 'paragraph',
      text: `A stronger model will usually be better at filling those gaps. If it succeeds, the immediate problem disappears, which makes it easy to conclude that model capability was the bottleneck.`,
    },
    {
      type: 'paragraph',
      text: `I think repeated escalation should make you ask another question. What did the stronger model have to figure out that the weaker one did not know?`,
    },
    {
      type: 'paragraph',
      text: `I've run into this directly while building Pantas, an exam-preparation app where I use multiple coding agents as workers across the same repository. Once several agents are involved, a prompt that says "work on this feature" stops being enough.`,
    },
    {
      type: 'paragraph',
      text: `A worker has to know which branch it owns, which worktree it is allowed to touch, what state it inherited, what counts as completion, which verification is required, and when it should stop instead of continuing into somebody else's scope.`,
    },
    {
      type: 'paragraph',
      text: `I could leave more of that implicit and give the worker a very capable model. It would probably infer the right answer much of the time.`,
    },
    {
      type: 'paragraph',
      text: `Instead, those details became part of the system around the model. A worker assignment carries an exact task ID, branch and worktree ownership, the base commit it started from, explicit scope, stop conditions, and verification requirements. Current worker state lives in a durable GitHub issue instead of relying on whatever happens to remain in a browser conversation. If a worker resumes in another chat, it re-reads that state before continuing.`,
    },
    {
      type: 'paragraph',
      text: `This is fairly boring infrastructure. It also removes entire categories of questions from the model's job. The worker no longer has to infer whether it owns a branch, decide whether another worker has superseded its instructions, or guess what evidence is enough to call the task finished.`,
    },
    {
      type: 'paragraph',
      text: `The model did not become more intelligent. The task started requiring less intelligence.`,
    },
    {
      type: 'paragraph',
      text: `The same idea applies further down the stack. Tests can remove ambiguity about behavior. Repository instructions can preserve constraints that would otherwise have to be rediscovered. A large feature can be decomposed before an implementation agent sees it. Concurrent workers can be isolated instead of asking a model to untangle overlapping changes afterward.`,
    },
    {
      type: 'paragraph',
      text: `None of this is specific to AI. It is mostly ordinary software engineering with a new reason to care about it.`,
    },
    {
      type: 'pullquote',
      text: `A stronger model can absorb a specification problem so well that it starts looking like a model problem that was solved.`,
    },

    {
      type: 'heading',
      id: 'spend-intelligence-on-uncertainty',
      text: 'Spend intelligence on uncertainty',
    },
    {
      type: 'paragraph',
      text: `I still want the better models. I just don't think every task should automatically get the best one available.`,
    },
    {
      type: 'paragraph',
      text: `There are parts of a project where a wrong decision has a large blast radius. Architecture is the obvious example. If I'm deciding where a new subsystem belongs, what its boundaries should be, how state should move through it, or how a large body of work should be split between agents, I want as much reasoning ability as I can get.`,
    },
    {
      type: 'paragraph',
      text: `The same applies when the problem itself has not been understood yet. A difficult bug that crosses storage, application state, and UI behavior may need a model that can hold all of those pieces together long enough to find the actual failure. Early planning can have similar demands because mistakes there become instructions for everything downstream.`,
    },
    {
      type: 'paragraph',
      text: `Once those decisions have been made, the work changes. An implementation worker might receive one bounded change with known constraints and executable tests. An orchestrator might inspect worker state, choose which prepared task runs next, and escalate anything that violates the plan. Another agent may be implementing a migration whose behavior has already been specified.`,
    },
    {
      type: 'paragraph',
      text: `There is little reason to assume all of those jobs need the same amount of intelligence.`,
    },
    {
      type: 'paragraph',
      text: `This is how I think about model triage. I care less about assigning permanent roles to specific model names and more about where uncertainty exists in the work. The strongest model belongs where the problem still needs to be understood or where a bad decision will propagate widely. A capable second tier can handle orchestration, review, delegation, and implementation that still involves meaningful judgment. Once a task is well specified enough, cheaper models become much more useful.`,
    },
    {
      type: 'paragraph',
      text: `The rankings will keep changing. The useful invariant is uncertainty.`,
    },
    {
      type: 'paragraph',
      text: `This also gives escalation some diagnostic value. If a task that was supposed to be mechanical repeatedly needs to move up the model stack, either the task is harder than I thought or I failed to remove enough ambiguity before delegating it.`,
    },
    {
      type: 'paragraph',
      text: `"Use the better model" may still be the right answer. I just don't think it should be the end of the diagnosis.`,
    },

    {
      type: 'heading',
      id: 'better-models-make-this-easier-to-ignore',
      text: 'Better models make this easier to ignore',
    },
    {
      type: 'paragraph',
      text: `There is a version of this argument where developers deliberately handicap themselves with weaker models to prove that their process is good. I don't see much value in that.`,
    },
    {
      type: 'paragraph',
      text: `If a new model produces fewer bad patches, understands my repository better, and requires less supervision, I will use it. Better tools are good.`,
    },
    {
      type: 'paragraph',
      text: `The problem starts when model capability becomes the default substitute for improving the environment around the model. If an agent can infer undocumented architecture, discover how a project verifies changes, and recover from poorly scoped tasks, there is less immediate pressure to make any of those things explicit.`,
    },
    {
      type: 'paragraph',
      text: `That can work for a surprisingly long time, especially with one agent.`,
    },
    {
      type: 'paragraph',
      text: `It becomes more fragile as throughput increases. Five agents working from an ambiguous requirement can produce five reasonable interpretations very quickly. They may all write competent code and still disagree about ownership, duplicate work, modify overlapping state, or build against assumptions nobody made explicit.`,
    },
    {
      type: 'paragraph',
      text: `Giving all five a better model probably improves the outcome. Giving them a better-defined problem may remove the disagreement entirely.`,
    },
    {
      type: 'paragraph',
      text: `This is the part of increasingly capable models that I think is easy to underestimate. They do not only let us solve harder engineering problems. They also let us tolerate worse engineering inputs.`,
    },
    {
      type: 'paragraph',
      text: `Code still gets written. Tests may still pass. The feature works because the model successfully inferred what the developer meant. Nothing forces the missing assumption to become part of the project, so the next agent gets to infer it again.`,
    },
    {
      type: 'paragraph',
      text: `Eventually some amount of the project's architecture, process, and specification effectively lives inside "the model is smart enough to figure it out."`,
    },
    {
      type: 'paragraph',
      text: `That is undocumented infrastructure.`,
    },
    {
      type: 'paragraph',
      text: `I would prefer not to depend on it.`,
    },
    {
      type: 'paragraph',
      text: `The next generation of coding models will almost certainly be better than the current one, and I'll use them when they are. But when a task suddenly becomes easy after switching models, I want to know why.`,
    },
    {
      type: 'paragraph',
      text: `Sometimes the answer really is that I needed a smarter model.`,
    },
    {
      type: 'paragraph',
      text: `Sometimes I needed a better specification.`,
    },
  ],
};
