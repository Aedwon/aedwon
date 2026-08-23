export interface BlogSource {
  number: number;
  author: string;
  title: string;
  publication?: string;
  details?: string;
  href: string;
}

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; id: string }
  | { type: 'pullquote'; text: string }
  | { type: 'sources'; items: BlogSource[] };

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  tags: string[];
  blocks: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'a-perfect-factory-can-still-make-something-nobody-wants',
    title: 'A perfect factory can still make something nobody wants',
    date: 'Aug 24, 2026',
    readTime: '11 min read',
    summary: 'What indie game postmortems can teach app developers about demand, technical admiration, and what changes when AI makes software cheaper to produce.',
    tags: ['Product', 'Engineering', 'AI'],
    blocks: [
      {
        type: 'paragraph',
        text: "I came across a post from Ben Vinegar about indie game postmortems. He'd noticed a recurring story in them. Someone spends a long time making a game, gets plenty of encouragement from other indie developers, then launches and discovers that the people following the project weren't necessarily the people who were going to buy it.",
      },
      {
        type: 'paragraph',
        text: "Underneath was a post from Sunil Pai about an incredible new software factory. It's highly optimized. Agents work in parallel, review other agents, share context, and improve the machinery that keeps all of it running.",
      },
      { type: 'paragraph', text: 'Someone eventually asks what the factory makes.' },
      { type: 'paragraph', text: 'Software.' },
      { type: 'paragraph', text: 'What software?' },
      { type: 'paragraph', text: 'For now, mostly improvements to the factory.' },
      {
        type: 'paragraph',
        text: "I don't make games, so I first read Vinegar's post as an interesting game development problem. Then I mentally replaced \"game\" with \"app\" and realized almost nothing about the problem changed.",
      },
      { type: 'paragraph', text: 'That bothered me a bit.' },
      {
        type: 'paragraph',
        text: "It also seems more important now than it would have a few years ago. We're getting much better at producing software quickly. If implementation gets cheaper, then being wrong about what to implement gets cheaper too.",
      },
      {
        type: 'paragraph',
        text: "That can be a very good thing. It can also mean building things nobody wants at a speed we couldn't previously afford.",
      },

      { type: 'heading', id: 'the-people-who-like-your-work', text: 'The people who like your work' },
      {
        type: 'paragraph',
        text: 'Indie game development happens to leave unusually good records of this problem because developers regularly publish postmortems with actual sales numbers.',
      },
      {
        type: 'paragraph',
        text: '*Prickle* is one example. It began as a Ludum Dare game made by a four-person team and ranked 32nd out of roughly 2,200 entries. The team kept working on it for another fourteen months. By launch, it had around 2,400 Steam wishlists.',
      },
      { type: 'paragraph', text: 'Two weeks later, it had sold around 500 copies.' },
      {
        type: 'paragraph',
        text: "The people who bought it seemed to like it. At the time of the team's postmortem, all 55 Steam reviews were positive. The developers' conclusion wasn't that they had made a terrible game. They thought one of their biggest problems was much simpler. There weren't that many Steam players looking for a difficult grid-based puzzle game.[1]",
      },
      {
        type: 'paragraph',
        text: "I found another postmortem for *Shapebreaker*, made by a solo developer. It sold a little over 2,000 copies and had an 83 percent positive review score. The developer still considered it commercially unsuccessful. He estimated that he would have needed roughly five times the sales for the result he had originally hoped for.[2]",
      },
      { type: 'paragraph', text: 'Nothing has to be secretly wrong with either game for those numbers to make sense.' },
      {
        type: 'paragraph',
        text: "People who bought *Prickle* apparently liked *Prickle*. That doesn't imply that a huge number of people wanted to buy *Prickle*. Those sound like nearly the same question until you're trying to make money from the answer.",
      },
      {
        type: 'paragraph',
        text: "Valve makes the distinction fairly explicit. Its Steamworks documentation says that buying and playing a game are strong signals of customer interest. Traffic to the store page by itself does not improve a game's visibility. Wishlists have some specific uses, but they mostly aren't part of the visibility algorithm either.[3]",
      },
      { type: 'paragraph', text: 'Apps have their own versions of this.' },
      {
        type: 'pullquote',
        text: "Someone telling me an app looks good is information. So is a GitHub star. So is a signup. If somebody is still using the thing three months later, I've learned something different.",
      },
      { type: 'paragraph', text: "The earlier signals aren't useless. They're just easier to collect." },
      { type: 'paragraph', text: "They're also much nicer to receive." },
      {
        type: 'paragraph',
        text: 'There is a particular problem with showing software to other software developers. They can appreciate things that the intended user may correctly have no opinion about.',
      },
      {
        type: 'paragraph',
        text: "Show another engineer a clever synchronization system, an unusual rendering trick, or an absurd amount of automation and they may genuinely think it's impressive. They're not lying. They may simply be admiring the wrong thing for the question you're trying to answer.",
      },
      { type: 'paragraph', text: 'Technical competence creates its own kind of audience.' },
      {
        type: 'paragraph',
        text: "A person can enjoy watching something get made without needing the finished thing. I follow projects I have no reason to buy. I've read through the source of software I barely use. I've watched people restore machinery I will probably never see in person.",
      },
      { type: 'paragraph', text: "There's nothing strange about any of that when I describe myself doing it." },
      { type: 'paragraph', text: "It becomes strangely easy to forget when I'm the one making the thing." },

      { type: 'heading', id: 'you-know-how-hard-it-was', text: 'You know how hard it was' },
      { type: 'paragraph', text: 'There is some research that makes this more uncomfortable.' },
      {
        type: 'paragraph',
        text: 'Michael Norton, Daniel Mochon, and Dan Ariely ran a series of experiments where people assembled IKEA boxes, folded origami, and built Lego sets. Participants placed more value on things they had made themselves. In some experiments they also expected other people to value their amateur creations more highly than those people actually did.',
      },
      { type: 'paragraph', text: 'The researchers called it the IKEA effect.[4]' },
      { type: 'paragraph', text: 'Software seems almost designed for this.' },
      { type: 'paragraph', text: 'A developer knows the history behind a feature.' },
      {
        type: 'paragraph',
        text: "You remember the version that corrupted the database. You know why the obvious implementation couldn't work. Maybe a bug took two days to reproduce and five minutes to fix. You know which edge cases are handled and why a strange-looking part of the code exists.",
      },
      { type: 'paragraph', text: 'The user gets none of that history.' },
      { type: 'paragraph', text: 'They tap the button.' },
      {
        type: 'paragraph',
        text: "This isn't an argument against invisible engineering. A database that doesn't lose somebody's data is valuable even if that person has no idea how difficult it was to make that true. Good engineering often disappears into the experience, which is probably how it should be.",
      },
      { type: 'paragraph', text: "The problem is using our knowledge of the effort as evidence of the product's value." },
      {
        type: 'paragraph',
        text: 'I can spend a week solving an interesting technical problem that should never have existed because the feature itself should never have existed.',
      },
      { type: 'paragraph', text: 'The solution can still be good.' },
      {
        type: 'paragraph',
        text: "That's probably one of the nastier versions of the problem because there is something real to be proud of. I can point at good code, a difficult bug that is now gone, cleaner architecture, better tests. None of it answers whether the feature deserved the week.",
      },
      {
        type: 'paragraph',
        text: "This is why I don't think \"other developers like this\" is a bad signal. It just has to remain what it is.",
      },
      {
        type: 'paragraph',
        text: 'The same applies to praise about an interface, stars on a repository, people asking when something will launch, or a post unexpectedly getting a lot of attention. None of these are fake. They support narrower claims than I might want them to support.',
      },

      { type: 'heading', id: 'the-factory-got-faster', text: 'The factory got faster' },
      { type: 'paragraph', text: 'This is the part of the factory joke that I keep coming back to.' },
      { type: 'paragraph', text: 'For a long time, software development placed a fairly expensive tax on bad ideas.' },
      {
        type: 'paragraph',
        text: "Not intentionally. Engineering cost is a terrible way to decide whether an idea is worthwhile. Plenty of useful software was never built because making it required too much time, money, or specialist knowledge. Small teams had to abandon things they might have done something interesting with.",
      },
      { type: 'paragraph', text: 'Still, the cost created friction.' },
      {
        type: 'paragraph',
        text: 'If an idea needed six engineers and a year of work, somebody eventually had to justify spending six engineers and a year on it. The answer could be wrong. Companies have demonstrated that often enough. But the question was difficult to avoid forever.',
      },
      { type: 'paragraph', text: 'That friction is changing.' },
      {
        type: 'paragraph',
        text: "I don't think AI has made software development trivial. My own experience with coding agents would make that hard to believe. Generated code still has to be understood, reviewed, tested, and fitted into everything that already exists. DORA's recent research describes something similar. AI can speed up the initial production of code while moving some of the saved time into auditing and verification.[5]",
      },
      { type: 'paragraph', text: "But it would also be strange to pretend the cost hasn't moved at all." },
      {
        type: 'paragraph',
        text: 'One person can attempt projects now that would have required much more time not very long ago. A small team can explore several implementations in parallel. An idea that once sounded too annoying to prototype can sometimes exist by the end of the afternoon.',
      },
      { type: 'paragraph', text: 'This changes more than development speed. It changes the economics of experimentation.' },
      { type: 'paragraph', text: 'Suppose I can build twice as much software in the same amount of time.' },
      { type: 'paragraph', text: 'I can test twice as many useful ideas.' },
      {
        type: 'pullquote',
        text: 'I can also build twice as much unnecessary software.\n\nBoth look like increased productivity for quite a while.',
      },
      {
        type: 'paragraph',
        text: "The difference may not appear in the codebase. The second team can have excellent test coverage. Its pull requests can move quickly. Its architecture can improve every month. Bugs can decline. The development process can become genuinely better by almost every engineering measure available to it.",
      },
      { type: 'paragraph', text: 'The product can still be the wrong product.' },
      {
        type: 'paragraph',
        text: 'Melissa Perri described an older version of this in *Escaping the Build Trap*. A company can become very good at shipping output and gradually allow shipping itself to stand in for producing a useful outcome.[6] The book predates the current generation of coding agents, but the phrase feels unusually appropriate now.',
      },
      { type: 'paragraph', text: "AI didn't create the build trap." },
      { type: 'paragraph', text: 'It can make the trap more productive.' },
      {
        type: 'paragraph',
        text: 'This is why some of the questions around AI development now feel incomplete to me. How much can an agent do without intervention? Can several work at once? Can an agent review another agent? How much context can the system preserve? How large an issue can one complete?',
      },
      { type: 'paragraph', text: 'I find these questions interesting. I spend time thinking about some of them myself.' },
      { type: 'paragraph', text: "They're factory questions." },
      {
        type: 'paragraph',
        text: "And factories are satisfying things to improve because improvement is measurable. The tests run faster. Agents make fewer mistakes. A specification becomes easier to execute. Another category of regression gets caught automatically. Yesterday's workflow is visibly worse than today's.",
      },
      { type: 'paragraph', text: 'There is always another improvement available.' },
      { type: 'paragraph', text: 'None of this necessarily teaches you whether somebody wants what the workflow produces.' },
      {
        type: 'paragraph',
        text: 'A faster factory also makes it easier to say, "We might as well build it and see."',
      },
      {
        type: 'paragraph',
        text: "Sometimes that's exactly the right response. Cheap experiments are useful. An idea that once needed a business case before anybody could touch it can now be tried, discarded, and learned from.",
      },
      { type: 'paragraph', text: 'But "cheap enough to try" and "worth continuing" aren\'t the same decision.' },
      { type: 'paragraph', text: 'I suspect that distinction is going to matter more.' },
      {
        type: 'paragraph',
        text: "If production keeps getting easier, some of the scarce judgment in software moves elsewhere. Not all of it. Engineering isn't going away. But deciding which problems deserve engineering starts carrying more weight.",
      },
      { type: 'paragraph', text: 'What should we build?' },
      { type: 'paragraph', text: 'Who is it actually for?' },
      { type: 'paragraph', text: 'What happened when they used it?' },
      { type: 'paragraph', text: 'When should we stop?' },
      { type: 'paragraph', text: "Those questions aren't new. The factory just used to be slower." },

      { type: 'heading', id: 'im-still-going-to-build-questionable-things', text: "I'm still going to build questionable things" },
      {
        type: 'paragraph',
        text: 'The obvious conclusion would be to become extremely serious about validation and refuse to make anything until there is convincing evidence of demand.',
      },
      { type: 'paragraph', text: "I don't want to do that either." },
      {
        type: 'paragraph',
        text: "Some software is worth making because the author wants it. A personal tool can have a market of one. Open-source software doesn't have to become a company. Experiments are allowed to fail. People also aren't very good at asking for things they haven't seen yet.",
      },
      {
        type: 'paragraph',
        text: "If every idea needed market evidence before somebody was allowed to try it, we'd probably get a lot of sensible software and miss some strange, good things.",
      },
      { type: 'paragraph', text: "So I'm not taking \"make sure people want it\" as a rule against building." },
      { type: 'paragraph', text: 'What I want to be more careful about is what I think I\'ve learned after I build.' },
      { type: 'paragraph', text: 'If developers find something technically interesting, I know developers find it technically interesting.' },
      { type: 'paragraph', text: "If people say they'd use an app, I know they say they'd use it." },
      {
        type: 'paragraph',
        text: "If they actually use it, I've learned something else. If they come back, something else again. If they stop, that's information too.",
      },
      { type: 'paragraph', text: "I don't need to turn each observation into a larger victory than it is." },
      {
        type: 'paragraph',
        text: "This all feels embarrassingly obvious once it's written down. I suspect that's part of why I found the indie game postmortems useful. Eventually the game ships. The store page is public. People either buy it or they don't. Enough time passes and the developer has numbers that are much harder to negotiate with.",
      },
      { type: 'paragraph', text: 'App development can postpone that moment for a surprisingly long time.' },
      {
        type: 'paragraph',
        text: "You can keep adding things. You can decide the lack of users is a marketing problem. You can redesign onboarding, rewrite the landing page, change the pricing, add another feature, improve the infrastructure, or conclude that the product simply isn't polished enough yet.",
      },
      { type: 'paragraph', text: 'Any of those could actually be the problem.' },
      { type: 'paragraph', text: "That's what makes this difficult." },
      {
        type: 'paragraph',
        text: "I don't think the answer is to distrust good engineering or stop caring about the craft of making software. I mostly want to remember that being impressed by the factory and wanting what comes out of it are two separate reactions.",
      },
      { type: 'paragraph', text: 'The factory is getting faster anyway.' },
      { type: 'paragraph', text: 'I think that makes the question of what it should make harder to ignore.' },

      {
        type: 'sources',
        items: [
          {
            number: 1,
            author: 'Sunbird Studio',
            title: 'Steam Release Postmortem',
            publication: 'Prickle',
            details: '2024',
            href: 'https://sunbirdstudio.itch.io/prickle-jam/devlog/845342/steam-release-postmortem',
          },
          {
            number: 2,
            author: 'Shapebreaker developer',
            title: 'Postmortem: Shapebreaker - solo developed - 2000 copies sold',
            publication: 'r/gamedev',
            details: '2023',
            href: 'https://www.reddit.com/r/gamedev/comments/13l013c/',
          },
          {
            number: 3,
            author: 'Valve',
            title: 'Visibility on Steam',
            publication: 'Steamworks Documentation',
            href: 'https://partner.steamgames.com/doc/marketing/visibility',
          },
          {
            number: 4,
            author: 'Michael I. Norton, Daniel Mochon, and Dan Ariely',
            title: 'The IKEA Effect: When Labor Leads to Love',
            publication: 'Journal of Consumer Psychology 22, no. 3',
            details: '2012, 453–460',
            href: 'https://doi.org/10.1016/j.jcps.2011.08.002',
          },
          {
            number: 5,
            author: 'DORA',
            title: 'State of AI-assisted Software Development 2025',
            href: 'https://dora.dev/research/2025/dora-report/',
          },
          {
            number: 6,
            author: 'Melissa Perri',
            title: 'Escaping the Build Trap: How Effective Product Management Creates Real Value',
            publication: "O'Reilly Media",
            details: '2018',
            href: 'https://www.oreilly.com/library/view/escaping-the-build/9781491973783/',
          },
        ],
      },
    ],
  },
];
