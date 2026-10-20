// The discovery question bank. Wording only: hours, risks and costs for each answer live in the private
// pricing repo's settings.json under answerKey(question, choice). Starter values are in defaults.ts.
import type { Question, Section, SectionId, WorkType } from './types';

export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: 'problem', title: 'Problem' },
  { id: 'people', title: 'People' },
  { id: 'scope', title: 'Scope' },
  { id: 'features', title: 'Features' },
  { id: 'data', title: 'Data' },
  { id: 'integrations', title: 'Integrations' },
  { id: 'hosting', title: 'Hosting' },
  { id: 'timing', title: 'Timing' },
  { id: 'budget', title: 'Budget' },
];

export const answerKey = (questionId: string, choiceId: string) => `${questionId}:${choiceId}`;

const NO = { id: 'no', label: 'No', none: true };

export const QUESTIONS: Question[] = [
  // shared
  { id: 'problem-trigger', section: 'problem', types: 'all', prompt: 'What made you look for help now?', hint: 'A deadline, a process that keeps breaking, a new idea. Listen for urgency and stakes.',
    choices: [{ id: 'new-idea', label: 'New idea, nothing exists yet' }, { id: 'replace', label: 'Replacing something that works badly' }, { id: 'broken', label: 'Something broke or is about to' }] },
  { id: 'problem-current', section: 'problem', types: 'all', prompt: 'How is this handled today?', hint: 'This is the baseline, and it tells you if there is data to move.',
    choices: [{ id: 'nothing', label: 'It is not handled at all' }, { id: 'manual', label: 'By hand or in spreadsheets' }, { id: 'tool', label: 'Another tool they want to leave' }] },
  { id: 'problem-success', section: 'problem', types: 'all', prompt: 'How will you know this worked, three months after launch?', hint: 'Listen for a number. No clear answer means the requirements are vague.',
    choices: [{ id: 'clear', label: 'Clear, measurable answer' }, { id: 'vague', label: 'Vague or unsure' }] },
  { id: 'people-decider', section: 'people', types: 'all', prompt: 'Who signs off on the proposal and the final result?', hint: 'If that person is not on this call, expect a second round.',
    choices: [{ id: 'on-call', label: 'Someone on this call' }, { id: 'elsewhere', label: 'Someone not on this call' }, { id: 'committee', label: 'A group or committee' }] },
  { id: 'people-feedback', section: 'people', types: 'all', prompt: 'Who gives feedback during the build?', hint: 'One named person is best. Several voices slow every review.',
    choices: [{ id: 'one', label: 'One named person' }, { id: 'several', label: 'Several people' }, { id: 'unclear', label: 'Not decided' }] },
  { id: 'people-maintainer', section: 'people', types: 'all', prompt: 'Who looks after it after launch?', hint: 'This decides whether upkeep is on the table.',
    choices: [{ id: 'me', label: 'They want me to' }, { id: 'team', label: 'Their own team' }, { id: 'unsure', label: 'Not sure yet' }] },
  { id: 'timing-deadline', section: 'timing', types: 'all', prompt: 'When does this need to be live?', hint: 'Ask what happens if it slips. A real deadline has a reason.',
    choices: [{ id: 'flexible', label: 'No fixed date' }, { id: 'normal', label: 'More than a month out' }, { id: 'rush', label: 'Within a month' }, { id: 'event', label: 'Tied to a fixed event' }] },
  { id: 'timing-response', section: 'timing', types: 'all', prompt: 'How fast can they answer questions and review work?',
    choices: [{ id: 'fast', label: 'Within a day or two' }, { id: 'slow', label: 'A week or more' }] },
  { id: 'budget-range', section: 'budget', types: 'all', prompt: 'Did they share a budget?', hint: 'Ask for a range. Do not name a number first. Write the figure in the notes.',
    choices: [{ id: 'range', label: 'Yes, a range' }, { id: 'none', label: 'No budget yet' }, { id: 'low', label: 'Far below the likely price' }] },
  { id: 'budget-payment', section: 'budget', types: 'all', prompt: 'How would they prefer to pay?',
    choices: [{ id: 'milestones', label: 'In milestones' }, { id: 'upfront', label: 'Mostly upfront' }, { id: 'after', label: 'After delivery' }] },

  // website
  { id: 'website-pages', section: 'scope', types: ['website'], prompt: 'How many distinct page designs?', hint: 'Count layouts, not pages. Ten blog posts share one layout.',
    choices: [{ id: 'few', label: '1 to 3' }, { id: 'some', label: '4 to 8' }, { id: 'many', label: '9 or more' }] },
  { id: 'website-content', section: 'scope', types: ['website'], prompt: 'Who writes the text and supplies the images?', hint: 'Missing content is the most common reason a website launch slips.',
    choices: [{ id: 'ready', label: 'They have it ready' }, { id: 'partial', label: 'Some of it' }, { id: 'nobody', label: 'Nobody yet' }] },
  { id: 'website-design', section: 'scope', types: ['website'], prompt: 'Is there a design or brand to follow?',
    choices: [{ id: 'full', label: 'Full designs ready' }, { id: 'brand', label: 'Brand only (logo, colors)' }, { id: 'nothing', label: 'Nothing, design from scratch' }] },
  { id: 'website-cms', section: 'features', types: ['website'], prompt: 'Will they edit the content themselves after launch?', feature: 'Content editing for your team',
    choices: [NO, { id: 'simple', label: 'Some text and images' }, { id: 'posts', label: 'A blog or regular posts' }] },
  { id: 'website-forms', section: 'features', types: ['website'], prompt: 'Contact forms, bookings or sign-ups?', feature: 'Forms and sign-ups',
    choices: [NO, { id: 'contact', label: 'A contact form' }, { id: 'booking', label: 'Bookings or a calendar' }] },
  { id: 'website-languages', section: 'features', types: ['website'], prompt: 'More than one language?', feature: 'More than one language',
    choices: [NO, { id: 'two', label: 'Two' }, { id: 'more', label: 'Three or more' }] },
  { id: 'website-seo', section: 'features', types: ['website'], prompt: 'Is search ranking a goal?', feature: 'Search engine setup',
    choices: [NO, { id: 'basic', label: 'Basic setup' }, { id: 'migration', label: 'Moving a site that already ranks' }] },
  { id: 'website-host', section: 'hosting', types: ['website'], prompt: 'Where will the website be hosted?',
    choices: [{ id: 'theirs', label: 'They have hosting' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },

  // web tool or app
  { id: 'webtool-users', section: 'scope', types: ['webtool'], prompt: 'Who uses the tool?', hint: 'Public users mean more care with security and load.',
    choices: [{ id: 'internal', label: 'Only their team' }, { id: 'public', label: 'The public' }, { id: 'both', label: 'Both' }] },
  { id: 'webtool-screens', section: 'scope', types: ['webtool'], prompt: 'How many main screens?', hint: 'Lists, forms, dashboards. Count screens with their own job.',
    choices: [{ id: 'few', label: '1 to 3' }, { id: 'some', label: '4 to 8' }, { id: 'many', label: '9 or more' }] },
  { id: 'webtool-login', section: 'features', types: ['webtool'], prompt: 'Do users need to sign in?', feature: 'Sign-in',
    choices: [NO, { id: 'simple', label: 'Email or Google sign-in' }, { id: 'roles', label: 'Different roles and permissions' }] },
  { id: 'webtool-reports', section: 'features', types: ['webtool'], prompt: 'Charts, reports or exports?', feature: 'Reports and exports', multi: true,
    choices: [NO, { id: 'export', label: 'CSV or PDF export' }, { id: 'charts', label: 'Charts and dashboards' }] },
  { id: 'webtool-payments', section: 'features', types: ['webtool'], prompt: 'Does it take payments?', feature: 'Payments',
    choices: [NO, { id: 'once', label: 'One-time payments' }, { id: 'subscriptions', label: 'Subscriptions' }] },
  { id: 'webtool-data', section: 'data', types: ['webtool'], prompt: 'What does it need to store?',
    choices: [{ id: 'nothing', label: 'Nothing lasting' }, { id: 'simple', label: 'A few simple tables' }, { id: 'linked', label: 'Many linked records' }] },
  { id: 'webtool-migrate', section: 'data', types: ['webtool'], prompt: 'Is there existing data to bring over?',
    choices: [NO, { id: 'clean', label: 'Yes, clean spreadsheets' }, { id: 'messy', label: 'Yes, messy or from another system' }] },
  { id: 'webtool-apis', section: 'integrations', types: ['webtool'], prompt: 'Does it connect to other services?', hint: 'Each outside API is a risk you do not control.',
    choices: [NO, { id: 'one', label: 'One service' }, { id: 'several', label: 'Several' }] },
  { id: 'webtool-host', section: 'hosting', types: ['webtool'], prompt: 'Where will the tool run?',
    choices: [{ id: 'theirs', label: 'Their servers or account' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },

  // Discord bot
  { id: 'bot-servers', section: 'scope', types: ['bot'], prompt: 'How many servers will use the bot?', hint: 'One server is a tool. Any server is a product.',
    choices: [{ id: 'one', label: 'One server' }, { id: 'few', label: 'A few they run' }, { id: 'public', label: 'Public, any server' }] },
  { id: 'bot-members', section: 'scope', types: ['bot'], prompt: 'How big is the largest server?',
    choices: [{ id: 'small', label: 'Under 1,000 members' }, { id: 'mid', label: '1,000 to 20,000' }, { id: 'large', label: 'Over 20,000' }] },
  { id: 'bot-commands', section: 'features', types: ['bot'], prompt: 'How many commands or actions?',
    choices: [{ id: 'few', label: '1 to 5' }, { id: 'some', label: '6 to 15' }, { id: 'many', label: '16 or more' }] },
  { id: 'bot-memory', section: 'features', types: ['bot'], prompt: 'Does it remember users between sessions?', hint: 'Leveling, economy, warnings, stats.', feature: 'Saved member data',
    choices: [NO, { id: 'simple', label: 'Yes, simple records' }, { id: 'history', label: 'Yes, with history and stats' }] },
  { id: 'bot-moderation', section: 'features', types: ['bot'], prompt: 'Moderation or automatic actions?', feature: 'Moderation tools',
    choices: [NO, { id: 'basic', label: 'Basic (warnings, filters)' }, { id: 'advanced', label: 'Advanced (appeals, logs, rules)' }] },
  { id: 'bot-tickets', section: 'features', types: ['bot'], prompt: 'Tickets, forms or sign-ups inside Discord?', feature: 'Tickets and sign-ups',
    choices: [NO, { id: 'yes', label: 'Yes' }] },
  { id: 'bot-dashboard', section: 'features', types: ['bot'], prompt: 'A web dashboard to manage it?', hint: 'If yes, add the web tool type to this call.', feature: 'Web dashboard',
    choices: [NO, { id: 'yes', label: 'Yes' }] },
  { id: 'bot-migrate', section: 'data', types: ['bot'], prompt: 'Is it replacing another bot?',
    choices: [NO, { id: 'yes', label: 'Yes, and its data must carry over' }] },
  { id: 'bot-apis', section: 'integrations', types: ['bot'], prompt: 'Does it pull data from outside services?', hint: 'Game APIs, sheets, Twitch. Each is a risk you do not control.',
    choices: [NO, { id: 'one', label: 'One service' }, { id: 'several', label: 'Several' }] },
  { id: 'bot-host', section: 'hosting', types: ['bot'], prompt: 'Where will the bot run?',
    choices: [{ id: 'theirs', label: 'Their server or account' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },
  { id: 'bot-uptime', section: 'hosting', types: ['bot'], prompt: 'How bad is it if the bot is down for an hour?',
    choices: [{ id: 'fine', label: 'Annoying, not serious' }, { id: 'bad', label: 'Events or payments break' }] },
];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
export const findQuestion = (id: string) => BY_ID.get(id);

// Shared questions plus every question for the chosen types, grouped in SECTIONS order. Empty sections are dropped.
export function mergeQuestions(types: WorkType[]): Section[] {
  const picked = new Map<string, Question>();
  for (const q of QUESTIONS) {
    if (q.types === 'all' || q.types.some((t) => types.includes(t))) picked.set(q.id, q);
  }
  return SECTIONS
    .map((s) => ({ ...s, questions: [...picked.values()].filter((q) => q.section === s.id) }))
    .filter((s) => s.questions.length > 0);
}
