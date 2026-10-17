# the 17 projects, in wall order, with what we actually know (rest in [brackets])
def note(**k): k.setdefault('depth','note'); return k
P=[
 dict(id='pantas',name='Pantas',type='Mobile app',media='phone',depth='case',
  desc='Android-first exam reviewer for Philippine civil service and university entrance preparation, with encrypted local study state and on-device FSRS-6 scheduling.',
  stack=['Flutter','Dart','Firebase','Drift','RevenueCat'],
  links=[dict(label='pantas.app',href='https://pantas.app')],
  facts=[('Role','Lead Architect & Developer'),('Status','Pre-launch'),('Platform','Android'),('Timeline','[Start] – present'),('Scale','158 lessons, 3,163 questions')],
  points=[('Works offline','Content ships inside the app and study state lives in an encrypted local database.'),('FSRS-6 review scheduling',"Each student's review dates adapt to their own answer history, computed on the device."),('A plan that adapts daily','The roadmap sizes each day from the work left, the days left and how the student actually studies.')],
  sections=[dict(h='Why Pantas',p=["[2–3 sentences: who it's for (civil service and university entrance exam takers), what's wrong with the reviewers they use today, and why working offline matters for them.]"]),
            dict(h='Keeping study state local',p=['Pantas stores its mutable study state in a Drift database instead of depending on a network request before a quiz can work. The database includes attempts, review state, quiz sessions, lesson progress, preferences, review logs, and a queue of changes waiting to sync.','The database is opened through Drift’s background native database path. Pantas generates a 32-byte key with Random.secure(), stores that key through flutter_secure_storage, and supplies it to SQLite3MultipleCiphers in SQLCipher compatibility mode.'],fig='[5s silent loop: answer → next review date]')],
  more=['What happens after an answer','How Pantas works: five systems','Building content before it reaches the app','Status and what’s next'],
  caseLabel='Read the full case study'),
 dict(id='msl',name='MSL Network Bot',type='Discord bot',media='discord',depth='writeup',
  desc='Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.',
  stack=['Python','MySQL'],links=[dict(label='[Invite or demo link]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Discord'),('Status','[Status]')]),
 dict(id='lakambini',name='Lakambini',type='Website redesign',media='web',depth='note',
  desc='Redesign of the website for Lakambini, an events and creative agency I worked with. [One line on what changed or the result.]',
  stack=[],stackText='[stack]',links=[dict(label='[lakambini url]',href='#')],
  facts=[('Client','Lakambini'),('Role','[Role]'),('Year','[Year]'),('Platform','Web')]),
 dict(id='agent',name='AI Agent Config',type='Developer tooling',media='term',depth='writeup',
  desc='Portable configuration system for coding agents that composes shared policy with project-owned rules and renders the selected result into provider-specific instruction files.',
  stack=['Python','Markdown','YAML'],links=[dict(label='[Source]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','CLI'),('Status','[Status]')]),
 dict(id='kiosk',name='Kiosk Survey',type='Android TV',media='tv',depth='writeup',
  desc='Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.',
  stack=['Flutter','Dart','Firebase','Android'],links=[],
  facts=[('Role','[Role]'),('Event','[Event]'),('Platform','Android TV'),('Ran for','8 hours, offline')]),
 dict(id='pso',name='PSO Scorer',type='Data system',media='data',depth='writeup',
  desc='Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers.',
  stack=['Python','pandas','NumPy','Sheets'],links=[],
  facts=[('Client','PSYSC'),('Role','Science Olympiad Core'),('Year','2024'),('Scale','4,000+ competitors')]),
 dict(id='qr',name='QR Studio',type='Web tool',media='web',depth='note',
  desc='In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests.',
  stack=['TypeScript','Vite','Tailwind'],links=[dict(label='[qr studio url]',href='#'),dict(label='[Source]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Web'),('Runs','Entirely in the browser')]),
 dict(id='webp',name='WebP Unli',type='Web tool',media='web',depth='note',
  desc='Next.js static export that converts supported images to WebP in a wasm-vips worker. Each queued file stores its own options, and completed results can be downloaded individually or as a ZIP.',
  stack=['Next.js','TypeScript','wasm-vips'],links=[dict(label='[webp unli url]',href='#'),dict(label='[Source]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Web'),('Runs','Entirely in the browser')]),
 dict(id='norala',name='Norala SB Portal',type='Civic tech',media='web',depth='writeup',
  desc='Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service.',
  stack=['Next.js','TypeScript','Tailwind'],links=[dict(label='[portal url]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Web'),('Status','Prototype, unofficial')]),
 dict(id='cup',name='MSL Collegiate Cup Bot',type='Discord bot',media='discord',depth='writeup',
  desc='Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts.',
  stack=['Python','Sheets'],links=[],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Discord'),('Status','[Status]')]),
 dict(id='ilocos',name='Ilocos Sur Esports Bot',type='Discord bot',media='discord',depth='writeup',
  desc='Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS.',
  stack=['Python','MySQL'],links=[],
  facts=[('Client','Ilocos Sur Provincial Government'),('Role','[Role]'),('Year','[Year]'),('Hosting','Hostinger VPS')]),
 dict(id='oppo',name='OPPO Cup Bot',type='Discord bot',media='discord',depth='writeup',
  desc='Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS.',
  stack=['Python','MySQL'],links=[],
  facts=[('Client','OPPO Philippines'),('Role','[Role]'),('Year','[Year]'),('Hosting','Hostinger VPS')]),
 dict(id='kqm',name='KQM Team DPS Calculator',type='Web tool',media='web',depth='note',
  desc='Theorycrafting calculator for character damage formulas, artifact substat rolls, and weapon scaling.',
  stack=['JavaScript','Vite'],links=[dict(label='[calculator url]',href='#')],
  facts=[('Role','[Role]'),('Year','[Year]'),('Platform','Web'),('For','KQM-standard theorycrafting')]),
 dict(id='aspire',name='Microsoft Aspire',type='Open source',media='repo',depth='note',repo='microsoft/aspire',
  desc='Code-first tooling for building, observing, and deploying distributed applications.',
  stack=['GitHub'],stackText='microsoft/aspire',links=[dict(label='github.com/microsoft/aspire',href='https://github.com/microsoft/aspire')],
  facts=[('Contribution','[your PR or contribution]'),('Year','[Year]')]),
 dict(id='opensre',name='OpenSRE',type='Open source',media='repo',depth='note',repo='Tracer-Cloud/opensre',
  desc='Open-source toolkit for building AI SRE agents for observability, incident response, and remediation.',
  stack=['GitHub'],stackText='Tracer-Cloud/opensre',links=[dict(label='github.com/Tracer-Cloud/opensre',href='https://github.com/Tracer-Cloud/opensre')],
  facts=[('Contribution','[your PR or contribution]'),('Year','[Year]')]),
 dict(id='dockroute',name='DockRoute',type='Open source',media='repo',depth='note',repo='Dockroute/Dockroute',
  desc='External-DNS for plain Docker hosts, keeping DNS records aligned with container routes.',
  stack=['GitHub'],stackText='Dockroute/Dockroute',links=[dict(label='github.com/Dockroute/Dockroute',href='https://github.com/Dockroute/Dockroute')],
  facts=[('Contribution','[your PR or contribution]'),('Year','[Year]')]),
 dict(id='bettergov',name='BetterGov PH',type='Open source',media='repo',depth='note',repo='bettergovph/bettergov',
  desc='Open-source effort building a better national website for the Philippines.',
  stack=['GitHub'],stackText='bettergovph/bettergov',links=[dict(label='github.com/bettergovph/bettergov',href='https://github.com/bettergovph/bettergov')],
  facts=[('Contribution','[your PR or contribution]'),('Year','[Year]')]),
]
for p in P:
    p['facts']=[dict(k=a,v=b) for a,b in p['facts']]
    if p.get('points'): p['points']=[dict(h=a,p=b) for a,b in p['points']]
    if p['depth']=='writeup':
        p['sections']=[dict(h='The brief',p=['[Who it was for and what they needed, in two or three sentences.]']),
                       dict(h='What I built',p=[p['desc'],'[One or two sentences on the hardest part, and how you solved it.]'],fig='[%s, in use]'%p['name']),
                       dict(h='How it went',p=['[The result: numbers if you have them, or what people said.]'])]
    if p['type']=='Open source':
        p['sections']=[dict(h='What I contributed',p=['[Your PR or contribution, in a sentence or two, with a link.]'])]

# Pantas: the whole case study lives on its page
_pan = P[0]
_pan.pop('more', None); _pan.pop('caseLabel', None)
_pan['sections'] = [
 dict(kind='text', h='Why Pantas', p=["[2–3 sentences: who it's for (civil service and university entrance exam takers), what's wrong with the reviewers they use today, and why working offline matters for them.]"]),
 dict(kind='text', h='Keeping study state local', p=[
  'Pantas stores its mutable study state in a Drift database instead of depending on a network request before a quiz can work. The database includes attempts, review state, quiz sessions, lesson progress, preferences, review logs, and a queue of changes waiting to sync.',
  'The database is opened through Drift’s background native database path. Pantas generates a 32-byte key with Random.secure(), stores that key through flutter_secure_storage, and supplies it to SQLite3MultipleCiphers in SQLCipher compatibility mode. The repository also records the migration details because changing the encryption library or secure-storage format incorrectly could leave an existing install unable to open its own database.',
  'The sync layer was built around that local state. Changes such as an updated review schedule are added to a persistent pending queue, which keeps failed operations available for another attempt. The Firestore mappers, push and pull paths, and conflict handling exist in the repository. They are not live in the current build because Firebase bootstrap is still intentionally unwired.']),
 dict(kind='text', h='What happens after an answer', p=['[Your existing text for this section.]'], fig='[5s silent loop: answer → next review date]'),
 dict(kind='systems', h='How Pantas works', p=['Five systems, from the daily plan to a second device. Each is labelled honestly: shipping is on main, candidate is built on a branch and still in review, planned is specified but not built.'], items=[
  dict(h='Adaptive roadmap', which='roadmap', vh='370px', p=["Every day, Pantas plans the student's day from what's left and how they actually study. The last stretch before the exam is review-only. Topics go weakest first, prerequisites first. What's left is spread evenly over the study days left, due reviews are added up to a typical day, one mock lands 1 to 6 days before the exam, and today is split into short sittings and frozen.", 'It rebuilds whenever something changes, like a new exam date or new content, and logs why.']),
  dict(h='Study loop', which='study', vh='370px', p=['The student never rates themselves. The app grades each answer from two facts: right or wrong, and how long it took. Wrong is Again, right but slower than 25 seconds is Hard, right and quick is Good. FSRS then decides when the question comes back: good recalls push it further out, a miss brings it back soon. It’s all written to the encrypted local database, so it works offline.', 'A per-student optimizer for the scheduler is specified but not built yet.']),
  dict(h='Content', which='content', vh='370px', p=["Lessons are Markdown and questions are YAML. Each question passes a checklist and a blind-solve by someone other than its author, then an importer that rejects mistakes like a wrong choice without an explanation. Questions waiting on a figure stay inactive until it's drawn.", "Content ships inside the app. Updates never touch a student's progress."]),
  dict(h='Insights', which='insights', vh='410px', p=["Pantas compares a student's own answers in two conditions, computed on the phone. Figures show as soon as both sides have data, but a sentence only appears once a standard statistical test says the gap is unlikely to be chance. Nothing unlocks at a fixed day or session count.", "Shown here is stamina: the first half of each mock against the second, checked with a two-proportion z-test. Other tendencies use Welch's t-test on log times, an exact binomial test and a Wilson interval. The student is an example."]),
  dict(h='Pro and backup', which='pro', vh='370px', p=["Pro is decided on the phone from the store through RevenueCat, so it works offline and never drops a student to Free on a stale answer. Backup only turns on when three things are true: signed in with Google, Pro on the phone, and a Pro flag the server sets from RevenueCat's signed events.", "From then on, changes upload 5 seconds after the last one and reach the student's other devices. If Pro ends, backup stops and everything stays on the phone."])]),
 dict(kind='text', h='Building content before it reaches the app', p=[
  'Questions are authored as structured files and pass through tooling before they are packed into the application. The authoring runbook has a validator for schema and content errors, followed by a Question Studio review step for flagged issues and duplicate stems. Questions that need a figure can stay inactive until the required illustration and renderer exist.',
  "The content model also separates two meanings of difficulty. Authored difficulty is only used to organize the writing progression from easier questions toward exam-level ones. It is not written into the runtime question model. FSRS difficulty belongs to an individual student's review state and changes from their actual review history instead.",
  'For the SQLite content path, the seed writer takes exported JSON and passes exams, subjects, topics, passages, questions, choices, lessons, and related records through the project’s content parsers before writing content.db. When it builds the shipped database asset, it hashes the finished SQLite file and writes a shortened digest into content_seed_version.dart. The installer can use that digest to tell that bundled content changed instead of relying on somebody remembering to update a date or version string by hand.']),
 dict(kind='status', h='Status and what’s next', p=['Pantas is still in pre-launch development. I keep unfinished pieces out of the feature claims until their runtime paths are actually connected.'], cols=[
  dict(h='Shipping (on main)', items=['Content pipeline and illustrations','Placement, study loop, mock exams','Insights, Wrapped, notifications','Pro, sync, consent-based telemetry','Build and release']),
  dict(h='Candidate (on a branch)', items=['Adaptive roadmap','Prepared Today session','Signed, encrypted content packages','Tendency confidence','Question QA round']),
  dict(h='Planned', items=['Content coverage audit','Per-student scheduler optimizer','Export link and scheduled cleanups','[Launch target]'])], link=dict(label='[Join the waitlist]', href='#')),
]
for _p in P:
    for _s in _p.get('sections', []):
        _s.setdefault('kind', 'text')

# writing: in the Index only (never on the wall); opens like a project
_POSTS = [
 ('w1', '[On building Pantas offline-first]', 'Pantas · offline-first', '[6] min'),
 ('w2', '[What 8 hours without internet taught me]', 'Kiosk Survey · events', '[4] min'),
 ('w3', '[Scoring 4,000 Olympiad competitors]', 'PSO Scorer · data', '[5] min'),
]
for _id, _t, _topic, _mins in _POSTS:
    P.append(dict(id=_id, name=_t, type='Writing', media='paper', depth='writeup', post=True,
        desc='[A two-line summary: what the piece is about and who it’s for.]',
        stack=[], stackText='', topic=_topic, mins=_mins, date='[Month DD, YYYY]',
        links=[], facts=[dict(k='Published', v='[Month DD, YYYY]'), dict(k='Reading time', v=_mins + ' read'), dict(k='Topic', v=_topic)],
        sections=[dict(kind='text', h='[First section]', p=['[The opening: the problem in plain words, and why it mattered to you.]', '[Body copy. Short paragraphs, real numbers, honest about what isn’t built yet.]']),
                  dict(kind='text', h='[Second section]', p=['[Body copy.]'], fig='[a figure]'),
                  dict(kind='text', h='[What I’d do differently]', p=['[Body copy.]'])]))
