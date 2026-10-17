import json,sys,re
SP='/tmp/claude-0/-home-claude/b086297c-46b7-58c4-b54f-622f0b217526/scratchpad/'
sys.path.insert(0,SP+'gen')
from projects import P
L=json.load(open(SP+'logos2.json'))
def lum(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
for k,v in L.items():
    v.setdefault('w','18'); v.setdefault('h','18'); v.setdefault('vb','0 0 24 24')
    if lum(v['c'])<0.06: v['c']='#EDEDED'
L['MySQL'].update(vb='-0.2 12.6 22.4 6.2', w='46', h='13')
TB=open(SP+'tileblocks.html').read()
VOL=open(SP+'gen/volumes_js.txt').read()
_src=open(SP+'gen/page.py').read()
exec(_src[_src.index('ICON={'):_src.index('def stage(')])  # ICON, TI
FI={'Published':'calendar','Reading time':'clock','Topic':'tag','Role':'person','Year':'calendar','Timeline':'calendar','Client':'building','Scale':'people','Ran for':'clock','Hosting':'server','Event':'flag','Contribution':'commit','For':'target','Runs':'browser'}
FICON={'person':"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0",'calendar':"M4 6.5h16v13.5H4zM4 10.5h16M8.5 4v4M15.5 4v4",'building':"M5 20.5V4.5h9v16M14 9.5h5v11M3 20.5h18M8 8h2.5M8 11.5h2.5M8 15h2.5",'people':"M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 14a6.5 6.5 0 0 1 3 6",'clock':"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",'server':"M4 4.5h16v6H4zM4 13.5h16v6H4zM7.5 7.5h.01M7.5 16.5h.01",'flag':"M5 21V4M5 4.5h11l-2 4 2 4H5",'commit':"M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 12h5.5M15.5 12H21",'target':"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12h.01",'browser':"M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 9h19",'tag':"M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8zM8 8h.01"}
KINDS=[('All','all',None),('Apps','phone',['Mobile app','Android TV']),('Bots','bot',['Discord bot']),('Web','web',['Website redesign','Web tool','Civic tech']),('Tools','term',['Developer tooling','Data system']),('Open source','repo',['Open source']),('Writing','pen',['Writing'])]
ICON['all']="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z"

def media(listkey, w, h, extra=''):
    return f'''<sc-for list="{{{{ {listkey} }}}}" as="v" hint-placeholder-count="1"><div style="position: relative; width: {w}; height: {h}; overflow: hidden{extra}"><div style="position: absolute; left: 50%; top: 50%; width: 520px; translate: -50% -50%; scale: {{{{ v.s }}}}">
{TB}
</div></div></sc-for>'''

T = r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Aedwon on a phone</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>
body{margin:0}
.ms{scrollbar-width:none;-webkit-overflow-scrolling:touch}.ms::-webkit-scrollbar{width:0;height:0}
.tbtn{border:none;background:none;padding:0;font-family:inherit;cursor:pointer;color:var(--c,#A1A1AA);transition:color .25s ease}
.lg path{fill:#8A8A93}
.tile{transition:opacity .35s ease,scale .45s cubic-bezier(.22,1,.36,1)}
.field{width:100%;box-sizing:border-box;height:44px;border:none;border-bottom:1px solid #26262c;background:transparent;color:#EDEDED;font-family:inherit;font-size:16px;padding:0 0 0 30px;outline:none}
.field:focus{border-bottom-color:#EDEDED}
.field::placeholder{color:#61616A}
a:focus-visible,button:focus-visible{outline:2px solid #EDEDED;outline-offset:2px}
.face{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.shade{position:absolute;inset:0;background:#000;pointer-events:none}
.edgeV{background-color:#E4E2DB;background-image:repeating-linear-gradient(to right,#E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)}
</style>
</helmet>
<div data-mob="{{ uid }}" style="position: relative; width: 390px; height: 844px; overflow: hidden; color: #EDEDED; font-family: 'Geist', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background-color: #0a0a0c; background-image: radial-gradient(circle, rgba(237,237,237,0.075) 1px, transparent 1.6px); background-size: 26px 26px; background-position: 0 {{ dotsY }}">

<!-- ===== WALL: a vertical picker. Scrolling turns a drum; whichever project reaches the middle is chosen. Only the neighbours either side show. ===== -->
<sc-if value="{{ sc.wall }}" hint-placeholder-val="{{ true }}">
<div aria-hidden="true" style="position: absolute; inset: 0; perspective: 900px; perspective-origin: 50% 340px; pointer-events: none">
<sc-for list="{{ wall }}" as="t" hint-placeholder-count="5">
<div style="position: absolute; left: 45px; top: {{ t.y }}; width: 300px; height: {{ t.h }}; translate: 0 -50%; transform: rotateX({{ t.rx }}deg) scale({{ t.sc }}); opacity: {{ t.op }}; visibility: {{ t.vis }}; z-index: {{ t.z }}; border-radius: 10px; overflow: hidden">
''' + media('t.ml','300px','{{ t.h }}') + r'''
</div>
</sc-for>
</div>
<!-- the scroller only carries the snapping and the taps; it draws nothing -->
<div class="ms" data-mscroll="{{ uid }}w" onScroll="{{ onWallScroll }}" style="position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory; scroll-padding-bottom: 164px">
<div style="height: 250px"></div>
<sc-for list="{{ wallHits }}" as="h" hint-placeholder-count="5">
<button class="tbtn" type="button" onClick="{{ h.tap }}" onFocus="{{ h.focus }}" aria-label="{{ h.aria }}" style="display: block; width: 300px; height: 180px; margin: 0 auto; scroll-snap-align: center; scroll-snap-stop: always"></button>
</sc-for>
<div style="height: 414px"></div>
</div>
<!-- where you are among all of them, like the rail on the desktop wall -->
<div aria-hidden="true" style="position: absolute; right: 10px; top: 272px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; pointer-events: none">
<sc-for list="{{ rail }}" as="r" hint-placeholder-count="17"><span style="display: block; height: 1.5px; width: {{ r.w }}; background: {{ r.c }}; transition: width .25s ease, background-color .25s ease"></span></sc-for>
</div>
<div aria-live="polite" style="position: absolute; left: 22px; right: 22px; bottom: 96px; display: flex; flex-direction: column; gap: 4px; pointer-events: none; opacity: {{ cap.op }}">
<span style="font-family: 'Geist Mono', monospace; font-size: 11.5px; color: #8A8A93">{{ cap.n }}</span>
<span style="font-size: 24px; font-weight: 600; letter-spacing: -0.03em">{{ cap.name }}</span>
<span style="font-size: 14px; color: #A1A1AA">{{ cap.type }}</span>
</div>
</sc-if>

<!-- ===== INDEX ===== -->
<sc-if value="{{ sc.index }}" hint-placeholder-val="{{ false }}">
<div class="ms" style="position: absolute; inset: 0; overflow-y: auto">
<div style="padding: 76px 22px 110px">
<div role="group" aria-label="Show a type" style="position: relative; display: flex; justify-content: space-between; height: 48px">
<sc-for list="{{ kinds }}" as="c" hint-placeholder-count="6"><button class="tbtn" type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" aria-label="{{ c.aria }}" style="--c: {{ c.col }}; width: 46px; height: 48px; display: flex; align-items: center; justify-content: center; gap: 3px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ c.icon }}"></path></svg><sup style="font-family: 'Geist Mono', monospace; font-size: 10px; vertical-align: 10px">{{ c.n }}</sup></button></sc-for>
<span aria-hidden="true" style="position: absolute; left: 0; bottom: 2px; width: 22px; height: 1.5px; background: #EDEDED; translate: {{ kindX }} 0; transition: translate .5s cubic-bezier(.34,1.3,.64,1)"></span>
</div>
<div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 18px">
<span style="font-size: 26px; font-weight: 600; letter-spacing: -0.035em">{{ kindName }}</span>
<span style="font-family: 'Geist Mono', monospace; font-size: 11.5px; color: #8A8A93">{{ countText }}</span>
</div>
<label style="position: relative; display: block; margin-top: 10px"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Find a project</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A93" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" style="position: absolute; left: 0; top: 13px"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5l-4.5-4.5"></path></svg><input class="field" value="{{ q }}" onInput="{{ setQ }}" placeholder="Find a project" type="search"></label>
<div style="display: flex; flex-direction: column; margin-top: 8px">
<sc-for list="{{ rows }}" as="r" hint-placeholder-count="10">
<button class="tbtn" type="button" onClick="{{ r.open }}" style="--c: #EDEDED; display: grid; grid-template-columns: 64px minmax(0, 1fr) 24px; gap: 14px; align-items: center; min-height: 60px; border-bottom: 1px solid #1c1c22; text-align: left; opacity: {{ r.op }}">
''' + media('r.ml','64px','40px', '; border-radius: 4px; background: #131317') + r'''
<span style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ r.name }}</span><span style="font-size: 12.5px; color: #8A8A93; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ r.stack }}</span></span>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A93" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ r.icon }}"></path></svg>
</button>
</sc-for>
</div>
</div>
</div>
</sc-if>

<!-- ===== PROJECT: the left page on top, then the work and the story ===== -->
<sc-if value="{{ sc.project }}" hint-placeholder-val="{{ false }}">
<div class="ms" data-mscroll="{{ uid }}p" onScroll="{{ onProjScroll }}" style="position: absolute; inset: 0; overflow-y: auto; background: #0a0a0c">
<div style="padding: 72px 22px 120px; display: flex; flex-direction: column; opacity: {{ cf }}">
<h1 style="margin: 0; font-size: 34px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.05">{{ p.name }}</h1>
<p style="margin: 12px 0 0; font-size: 15.5px; line-height: 1.6; color: #A1A1AA">{{ p.desc }}</p>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 18px">
<sc-for list="{{ logos }}" as="g" hint-placeholder-count="3"><svg class="lg" width="{{ g.w }}" height="{{ g.h }}" viewBox="{{ g.vb }}" role="img" aria-label="{{ g.t }}"><path d="{{ g.d }}"></path></svg></sc-for>
<span style="font-family: 'Geist Mono', monospace; font-size: 12px; color: #8A8A93">{{ stackText }}</span>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1fr); gap: 11px; margin-top: 22px; padding-top: 18px; border-top: 1px solid #1c1c22">
<sc-for list="{{ details }}" as="d" hint-placeholder-count="4"><div style="display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #D4D4D8; min-width: 0"><span style="display: flex; flex: none; width: 16px; height: 16px; color: #8A8A93"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: {{ d.iconDisp }}"><path d="{{ d.icon }}"></path></svg><span style="display: {{ d.dotDisp }}; margin: 4px; width: 8px; height: 8px; border-radius: 99px; background: {{ d.dot }}"></span></span><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">{{ d.label }}: </span>{{ d.v }}</span></div></sc-for>
</div>
<sc-for list="{{ links }}" as="l" hint-placeholder-count="1"><a href="{{ l.href }}" style="margin-top: 18px; font-size: 15px; color: #EDEDED; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: #4a4a52">{{ l.label }} ↗</a></sc-for>
<div style="margin-top: 26px; border-radius: 10px; background: #131317">''' + media('heroL','346px','{{ heroH }}') + r'''</div>
<sc-if value="{{ isCase }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; gap: 18px; margin-top: 28px"><sc-for list="{{ p.points }}" as="k" hint-placeholder-count="3"><div style="display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid #2a2a30"><span style="font-size: 16px; font-weight: 600">{{ k.h }}</span><span style="font-size: 14.5px; line-height: 1.6; color: #A1A1AA">{{ k.p }}</span></div></sc-for></div></sc-if>
<sc-for list="{{ sections }}" as="s" hint-placeholder-count="3">
<section id="{{ s.id }}" style="display: flex; flex-direction: column; gap: 12px; padding-top: 40px">
<h2 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em">{{ s.h }}</h2>
<sc-for list="{{ s.p }}" as="para" hint-placeholder-count="2"><p style="margin: 0; font-size: 16px; line-height: 1.7; color: #A1A1AA">{{ para }}</p></sc-for>
<sc-if value="{{ s.hasFig }}" hint-placeholder-val="{{ false }}"><div style="height: 220px; border-radius: 10px; background: #131317; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 11px; color: #6b6f7c; text-align: center; padding: 0 16px">{{ s.fig }}</div></sc-if>
<sc-if value="{{ s.isSystems }}" hint-placeholder-val="{{ false }}"><sc-for list="{{ s.items }}" as="it" hint-placeholder-count="5"><div style="display: flex; flex-direction: column; gap: 10px; padding-top: 22px; border-top: 1px solid #1c1c22"><h3 style="margin: 0; font-size: 18px; font-weight: 600">{{ it.h }}</h3><sc-for list="{{ it.p }}" as="q" hint-placeholder-count="2"><p style="margin: 0; font-size: 15px; line-height: 1.65; color: #A1A1AA">{{ q }}</p></sc-for><div style="position: relative; width: 346px; height: {{ it.mh }}; overflow: hidden"><div style="position: absolute; left: 0; top: 0; width: 600px; height: {{ it.vh }}; transform-origin: 0 0; scale: 0.5767"><dc-import name="SystemViz" which="{{ it.which }}" hint-size="600px,370px"></dc-import></div></div></div></sc-for></sc-if>
<sc-if value="{{ s.isStatus }}" hint-placeholder-val="{{ false }}"><sc-for list="{{ s.cols }}" as="col" hint-placeholder-count="3"><div style="display: flex; flex-direction: column; padding-top: 10px; border-top: 1px solid #2a2a30; font-size: 14.5px; line-height: 1.7"><span style="font-size: 13px; color: #8A8A93; padding-bottom: 4px">{{ col.h }}</span><sc-for list="{{ col.items }}" as="li" hint-placeholder-count="4"><span style="color: #D4D4D8">{{ li }}</span></sc-for></div></sc-for></sc-if>
</section>
</sc-for>
<button class="tbtn" type="button" onClick="{{ goNext }}" style="--c: #EDEDED; margin-top: 56px; padding-top: 18px; border-top: 1px solid #1f1f24; display: flex; flex-direction: column; gap: 6px; text-align: left"><span style="font-size: 13px; color: #8A8A93">Next project</span><span style="font-size: 24px; font-weight: 600; letter-spacing: -0.03em">{{ nx.name }} →</span></button>
</div>
</div>
<!-- contents: a small square in the corner shows where you are; tap it for the parts -->
<sc-if value="{{ hasToc }}" hint-placeholder-val="{{ false }}">
<button class="tbtn" type="button" onClick="{{ toggleToc }}" aria-label="Contents" aria-expanded="{{ tocOpen }}" style="--c: #EDEDED; position: absolute; right: 18px; bottom: 26px; width: 48px; height: 48px; border-radius: 12px; background: rgba(17,17,20,.9); border: 1px solid #26262c; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px)">
<sc-for list="{{ ticks }}" as="k" hint-placeholder-count="5"><span style="display: block; height: 1.5px; width: {{ k.w }}; background: {{ k.c }}; border-radius: 1px"></span></sc-for>
</button>
<div aria-hidden="{{ tocHidden }}" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 12px 30px; border-radius: 16px 16px 0 0; background: rgba(17,17,20,.97); border-top: 1px solid #26262c; translate: 0 {{ tocY }}; transition: translate .4s cubic-bezier(.22,1,.36,1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px)">
<sc-for list="{{ sections }}" as="s" hint-placeholder-count="5"><button class="tbtn" type="button" onClick="{{ s.jump }}" style="--c: {{ s.col }}; display: block; width: 100%; min-height: 48px; padding: 0 12px; text-align: left; font-size: 16px">{{ s.h }}</button></sc-for>
</div>
</sc-if>
</sc-if>

<!-- ===== SHELF: on a narrow screen the volumes lie in a stack, spines out, so each one is a full-width target with its title the right way up ===== -->
<sc-if value="{{ sc.shelf }}" hint-placeholder-val="{{ false }}">
<div style="position: absolute; inset: 0; opacity: {{ stk.op }}">
<span style="position: absolute; left: 0; right: 0; top: 214px; text-align: center; font-family: 'Geist Mono', monospace; font-size: 11.5px; color: #8A8A93; opacity: {{ stk.hintOp }}">Six volumes</span>
<sc-for list="{{ books }}" as="b" hint-placeholder-count="6">
<button class="tbtn" type="button" onClick="{{ b.open }}" aria-label="{{ b.aria }}" style="--c: {{ b.ink }}; position: absolute; left: {{ b.x }}; top: {{ b.y }}; width: {{ b.w }}; height: {{ b.h }}; box-sizing: border-box; padding: 0 16px; display: flex; align-items: center; gap: 14px; border-radius: 3px; background: {{ b.tone }}; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), inset 0 -5px 10px rgba(0,0,0,.22); translate: {{ b.tx }} 0; opacity: {{ b.op }}; text-align: left">
<span style="display: flex; flex-direction: column; align-items: center; width: 30px; flex: none"><span style="font-family: 'Geist Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em; opacity: .7">VOL.</span><span style="font-size: 18px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05">{{ b.n }}</span></span>
<span style="width: 1px; height: 46%; background: currentColor; opacity: .28; flex: none"></span>
<span style="flex: 1; min-width: 0; font-size: {{ b.fs }}; font-weight: 800; letter-spacing: 0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ b.title }}</span>
<span style="width: 1px; height: 46%; background: currentColor; opacity: .28; flex: none"></span>
<span style="font-family: 'Geist Mono', monospace; font-size: 8.5px; letter-spacing: 0.22em; opacity: .7; flex: none">AEDWON</span>
</button>
</sc-for>
<div style="position: absolute; left: 18px; right: 18px; top: 652px; height: 2px; background: #34343b"></div>
<div style="position: absolute; left: 18px; right: 18px; top: 654px; height: 12px; background: #141418"></div>
<span style="position: absolute; left: 0; right: 0; top: 690px; text-align: center; font-size: 14px; color: #8A8A93; opacity: {{ stk.hintOp }}">Tap a volume to open it</span>
</div>
<!-- the chosen volume slides out of the stack, turns its cover to you and grows to reading size -->
<sc-if value="{{ mo.on }}" hint-placeholder-val="{{ false }}">
<div aria-hidden="true" style="position: absolute; left: {{ mo.x }}; top: {{ mo.y }}; width: {{ mo.w }}; height: {{ mo.h }}; border-radius: 3px; overflow: hidden; background: {{ mo.tone }}; color: {{ mo.ink }}; box-shadow: 0 24px 60px rgba(0,0,0,{{ mo.sh }})">
<div style="position: absolute; left: 0; bottom: 0; width: 420px; height: 600px; transform-origin: 0 100%; scale: {{ mo.cs }}; opacity: {{ mo.cop }}"><div style="position: absolute; left: -0px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ mo.tone }}; color: {{ mo.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ mo.n }}</span><span style="font-size: {{ mo.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ mo.title }}</span></div></div>
<div style="position: absolute; inset: 0; padding: 0 16px; display: flex; align-items: center; gap: 14px; opacity: {{ mo.sop }}"><span style="font-size: 18px; font-weight: 800">{{ mo.n }}</span><span style="font-size: 17px; font-weight: 800; white-space: nowrap">{{ mo.title }}</span></div>
</div>
</sc-if>
</sc-if>

<!-- ===== BOOK: an open book, read one page at a time. The camera sits on one page; the other shows at the edge. Turning a page carries the camera with it to the back of that page, so nothing ever vanishes. ===== -->
<sc-if value="{{ sc.book }}" hint-placeholder-val="{{ false }}">
<div style="position: absolute; inset: 0; opacity: {{ bk.op }}; translate: 0 {{ bk.drop }}">
<div style="position: absolute; left: 0; right: 0; top: 64px; text-align: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #8A8A93; opacity: {{ bk.ctlOp }}; transition: opacity .25s ease">{{ bk.head }}</div>
<div onPointerDown="{{ swDown }}" onPointerUp="{{ swUp }}" style="position: absolute; left: 0; top: 0; width: 390px; height: 700px; perspective: 1700px; perspective-origin: 195px 335px; translate: 0 {{ bk.dy }}; transition: translate .38s cubic-bezier(.22,1,.36,1); touch-action: pan-y">
<div style="position: absolute; left: {{ bk.x }}; top: 92px; width: 680px; height: 486px; transform-style: preserve-3d">
<!-- the page block: thickness under each side, more on the side you've read -->
<span aria-hidden="true" class="edgeV" style="position: absolute; left: {{ bk.lEdgeL }}; top: 3px; width: {{ bk.lEdgeW }}; height: 480px; visibility: {{ bk.lVis }}; border-radius: 2px 0 0 2px"></span>
<span aria-hidden="true" class="edgeV" style="position: absolute; left: 680px; top: 3px; width: {{ bk.rEdgeW }}; height: 480px; border-radius: 0 2px 2px 0"></span>
<div style="position: absolute; left: 0; top: 0; width: 340px; height: 486px; overflow: hidden; border-radius: 3px 0 0 3px; visibility: {{ bk.lVis }}; box-shadow: 0 24px 60px rgba(0,0,0,.45)"><div style="width: 420px; height: 600px; transform-origin: 0 0; scale: 0.8095"><dc-import name="BookPage" page="{{ bk.L }}" side="left" clock="{{ clock }}" form="{{ form }}" on-field="{{ setField }}" on-shelve="{{ shelve }}" on-go="{{ goPage }}" on-next-vol="{{ nextVol }}" hint-size="420px,600px"></dc-import></div></div>
<div style="position: absolute; left: 340px; top: 0; width: 340px; height: 486px; overflow: hidden; border-radius: 0 3px 3px 0; box-shadow: 0 24px 60px rgba(0,0,0,.45)"><div style="width: 420px; height: 600px; transform-origin: 0 0; scale: 0.8095"><dc-import name="BookPage" page="{{ bk.R }}" side="right" clock="{{ clock }}" form="{{ form }}" on-field="{{ setField }}" on-shelve="{{ shelve }}" on-go="{{ goPage }}" on-next-vol="{{ nextVol }}" hint-size="420px,600px"></dc-import></div>
<span aria-hidden="true" style="position: absolute; left: 0; top: 0; bottom: 0; width: {{ bk.castRW }}; background: linear-gradient(90deg, rgba(0,0,0,.30), rgba(0,0,0,0)); opacity: {{ bk.castR }}; pointer-events: none"></span></div>
<span aria-hidden="true" style="position: absolute; left: {{ bk.castLX }}; top: 0; width: {{ bk.castLW }}; height: 486px; background: linear-gradient(270deg, rgba(0,0,0,.30), rgba(0,0,0,0)); opacity: {{ bk.castL }}; pointer-events: none"></span>
<!-- the turning leaf (or the cover), hinged at the spine, in six strips so it curls -->
<div aria-hidden="true" style="position: absolute; left: 340px; top: 0; width: 420px; height: 600px; transform-origin: 0 0; scale: 0.8095; transform-style: preserve-3d; pointer-events: none; visibility: {{ bk.leafVis }}">
<div style="position: absolute; left: 0px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t1 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -0px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -0px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s1a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -350px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s1b }}"></span></div>
<div style="position: absolute; left: 70px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t2 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -70px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -70px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s2a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -280px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s2b }}"></span></div>
<div style="position: absolute; left: 70px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t3 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -140px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -140px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s3a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -210px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s3b }}"></span></div>
<div style="position: absolute; left: 70px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t4 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -210px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -210px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s4a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -140px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s4b }}"></span></div>
<div style="position: absolute; left: 70px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t5 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -280px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -280px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s5a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -70px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s5b }}"></span></div>
<div style="position: absolute; left: 70px; top: 0; width: 70px; height: 600px; transform-origin: 0 50%; transform: {{ bk.t6 }}; transform-style: preserve-3d">
<div class="face" style="inset: 0 -1px 0 0; overflow: hidden"><sc-if value="{{ bk.isCover }}" hint-placeholder-val="{{ false }}"><div style="position: absolute; left: -350px; top: 0; width: 420px; height: 600px; box-sizing: border-box; padding: 44px 40px; background: {{ bk.tone }}; color: {{ bk.ink }}; display: flex; flex-direction: column"><span style="position: absolute; left: 14px; top: 0; bottom: 0; width: 1px; background: currentColor; opacity: .14"></span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.22em; opacity: .7">AEDWON</span><span style="margin-top: auto; font-size: 150px; font-weight: 800; letter-spacing: -0.075em; line-height: .86">{{ bk.n }}</span><span style="font-size: {{ bk.cfs }}; font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; overflow-wrap: anywhere">{{ bk.title }}</span></div></sc-if><sc-if value="{{ bk.notCover }}" hint-placeholder-val="{{ true }}"><div style="position: absolute; left: -350px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.A }}" side="right" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div></sc-if><span class="shade" style="opacity: {{ bk.s6a }}"></span></div>
<div class="face" style="inset: 0 -1px 0 0; transform: rotateY(180deg); overflow: hidden"><div style="position: absolute; left: -0px; top: 0; width: 420px; height: 600px"><dc-import name="BookPage" page="{{ bk.B }}" side="left" clock="{{ clock }}" form="{{ form }}" hint-size="420px,600px"></dc-import></div><span class="shade" style="opacity: {{ bk.s6b }}"></span></div>
</div></div></div></div></div></div>
</div>
</div>
</div>
<div style="position: absolute; left: 20px; right: 20px; top: 612px; display: flex; align-items: center; justify-content: space-between; opacity: {{ bk.ctlOp }}; pointer-events: {{ bk.ctlPe }}; transition: opacity .25s ease">
<button class="tbtn" type="button" onClick="{{ prevPage }}" aria-label="Previous page" style="--c: {{ bk.prevC }}; width: 48px; height: 48px; font-size: 20px">←</button>
<span style="font-family: 'Geist Mono', monospace; font-size: 12px; color: #A1A1AA">{{ bk.pos }}</span>
<button class="tbtn" type="button" onClick="{{ nextPage }}" aria-label="Next page" style="--c: {{ bk.nextC }}; width: 48px; height: 48px; font-size: 20px">→</button>
</div>
</div>
<!-- stand-in for the phone's keyboard (the design canvas has none); on a real phone the page reads the real one's height -->
<div aria-hidden="true" style="position: absolute; left: 0; right: 0; bottom: 0; height: 291px; box-sizing: border-box; padding: 10px 3px 0; background: #1e1e21; display: flex; flex-direction: column; gap: 11px; translate: 0 {{ kbd.y }}; transition: translate .32s cubic-bezier(.22,1,.36,1); visibility: {{ kbd.vis }}">
<div style="display: flex; gap: 6px; padding: 0 0"><sc-for list="{{ kbd.r1 }}" as="k" hint-placeholder-count="10"><span style="flex: 1; height: 42px; border-radius: 5px; background: #46464b"></span></sc-for></div>
<div style="display: flex; gap: 6px; padding: 0 18px"><sc-for list="{{ kbd.r2 }}" as="k" hint-placeholder-count="9"><span style="flex: 1; height: 42px; border-radius: 5px; background: #46464b"></span></sc-for></div>
<div style="display: flex; gap: 6px"><span style="width: 44px; height: 42px; border-radius: 5px; background: #313135"></span><div style="flex: 1; display: flex; gap: 6px; padding: 0 8px"><sc-for list="{{ kbd.r3 }}" as="k" hint-placeholder-count="7"><span style="flex: 1; height: 42px; border-radius: 5px; background: #46464b"></span></sc-for></div><span style="width: 44px; height: 42px; border-radius: 5px; background: #313135"></span></div>
<div style="display: flex; gap: 6px"><span style="width: 92px; height: 42px; border-radius: 5px; background: #313135"></span><span style="flex: 1; height: 42px; border-radius: 5px; background: #46464b"></span><span style="width: 92px; height: 42px; border-radius: 5px; background: #313135"></span></div>
</div>
</sc-if>

<!-- ===== top bar ===== -->
<div style="position: absolute; left: 0; right: 0; top: 0; height: 56px; padding: 0 10px 0 22px; display: flex; align-items: center; justify-content: space-between; background: rgba(10,10,12,.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px)">
<span style="font-size: 16px; font-weight: 600; letter-spacing: -0.02em">Aedwon</span>
<sc-if value="{{ showBack }}" hint-placeholder-val="{{ false }}"><button class="tbtn" type="button" onClick="{{ back }}" style="--c: #EDEDED; height: 44px; padding: 0 12px; font-size: 15px">{{ backLabel }}</button></sc-if>
</div>

<!-- ===== bottom bar: the same four as the desktop nav, and the same travelling line ===== -->
<nav aria-label="Main" style="position: absolute; left: 0; right: 0; bottom: 0; height: 74px; padding: 0 12px 14px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-around; background: rgba(10,10,12,.86); border-top: 1px solid #1c1c22; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); translate: 0 {{ barY }}; transition: translate .4s cubic-bezier(.22,1,.36,1)">
<sc-for list="{{ tabs }}" as="t" hint-placeholder-count="4"><button class="tbtn" type="button" onClick="{{ t.go }}" aria-current="{{ t.cur }}" style="--c: {{ t.col }}; width: 82px; height: 48px; font-size: 14.5px">{{ t.label }}</button></sc-for>
<span aria-hidden="true" style="position: absolute; left: 0; top: 46px; width: 26px; height: 1.5px; background: #EDEDED; translate: {{ tabX }} 0; transition: translate .55s cubic-bezier(.34,1.3,.64,1)"></span>
</nav>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"screen":{"editor":"enum","options":["wall","index","project","shelf","book"],"default":"wall"},"project":{"editor":"text","default":"pantas"},"vol":{"editor":"int","default":0},"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.uid = 'mb' + Math.floor(Math.random() * 1e9);
    this.P = __P__; this.LOGO = __L__; this.ICON = __I__; this.TI = __TI__; this.FI = __FI__; this.FICON = __FICON__; this.KINDS = __K__;
__VOL__
    const pi = Math.max(0, this.P.findIndex((p) => p.id === props.project));
    const scr = ['wall', 'index', 'project', 'shelf', 'book'].indexOf(props.screen) >= 0 ? props.screen : 'wall';
    const startBook = scr === 'book';
    this.state = { tick: 0, screen: startBook ? 'shelf' : scr, from: scr === 'project' ? 'wall' : 'shelf', pi, filt: null, q: '', vol: props.vol || 0, sp: 0, side: 'L', turn: null, pan: null, opening: null, closing: null, kb: false, tocOpen: false, cur: 0, focus: 0, swapAt: -1e9, form: { name: '', mail: '', msg: '', title: '' } };
    // the book boards open their volume by themselves so you can watch it
    if (startBook) this.autoOpen = props.vol || 0;
  }
  componentDidMount() {
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => { this.setState({ tick: this.state.tick + 1 }); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
    if (this.autoOpen != null) this.ao = setTimeout(() => this.openVol(this.autoOpen), 700);
    // a field in the book takes focus: the keyboard comes up and the book lifts so the field stays in sight
    this.onFin = (e) => { const root = document.querySelector('[data-mob="' + this.uid + '"]'), t = e.target; if (!root || !root.contains(t) || !/^(INPUT|TEXTAREA)$/.test(t.tagName) || this.state.screen !== 'book') return; clearTimeout(this.kbT); const rr = root.getBoundingClientRect(), k = rr.width / 390, r = t.getBoundingClientRect(), d = this.kbDy || 0; this.kbField = { top: (r.top - rr.top) / k - d, bottom: (r.bottom - rr.top) / k - d }; this.setState({ kb: true }); };
    this.onFout = () => { clearTimeout(this.kbT); this.kbT = setTimeout(() => this.setState({ kb: false }), 120); };
    document.addEventListener('focusin', this.onFin); document.addEventListener('focusout', this.onFout);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); clearTimeout(this.ao); clearTimeout(this.kbT); document.removeEventListener('focusin', this.onFin); document.removeEventListener('focusout', this.onFout); }
  go(screen, extra) { this.setState({ screen, tocOpen: false, ...(extra || {}) }); }
  openProject(i) { this.go('project', { pi: i, from: this.state.screen === 'project' ? this.state.from : this.state.screen, swapAt: performance.now(), cur: 0 }); const sc = document.querySelector('[data-mscroll="' + this.uid + 'p"]'); if (sc) sc.scrollTop = 0; }
  // ---- the book. Spread s shows pages 2s (left) and 2s+1 (right); spread -1 is the closed cover.
  busy() { const st = this.state; return !!(st.turn || st.opening || st.closing || st.kb); }
  sx(side) { return side === 'L' ? 365 : 25; }   // where the spine sits on screen when reading that side
  panTo(side) { if (side === this.state.side) return; this.setState({ side, pan: { from: this.camX(), t0: performance.now() } }); }
  turn(to, then) { const st = this.state; this.setState({ turn: { from: st.sp, to, t0: performance.now(), dur: st.sp < 0 ? 1050 : 900, then: then || null, x0: this.camX() } }); }
  next() { const st = this.state, v = this.V[st.vol]; if (this.busy()) return; if (st.side === 'L') return this.panTo('R'); if (st.sp < v.all.length / 2 - 1) this.turn(st.sp + 1); }
  prev() { const st = this.state; if (this.busy()) return; if (st.side === 'R') return this.panTo('L'); if (st.sp > 0) this.turn(st.sp - 1); }
  goPage(i) { const st = this.state; if (this.busy()) return; const s = Math.floor(i / 2), side = i % 2 ? 'R' : 'L'; if (s === st.sp) this.panTo(side); else this.turn(s, side); }
  openVol(i) { if (this.state.opening) return; this.setState({ screen: 'shelf', vol: i, opening: { i, t0: performance.now() }, closing: null, kb: false }); }
  closeBook() { if (this.state.closing) return; this.setState({ closing: { t0: performance.now() }, kb: false }); const a = document.activeElement; if (a && a.blur) a.blur(); }
  camX() { const st = this.state, now = performance.now(), cl = (x) => Math.max(0, Math.min(1, x)), ease = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    if (st.turn) { const e = ease((now - st.turn.t0) / st.turn.dur), fwd = st.turn.to > st.turn.from; return st.turn.x0 + ((fwd ? 365 : 25) - st.turn.x0) * e; }
    if (st.pan) { const t = cl((now - st.pan.t0) / 450), e = 1 - Math.pow(1 - t, 3); return st.pan.from + (this.sx(st.side) - st.pan.from) * e; }
    return this.sx(st.side); }
  stackRect(i) { const H = [67, 54, 61, 77, 51, 45], W = [326, 312, 334, 304, 320, 298], O = [-4, 6, -2, 3, -6, 2]; let y = 652 - H.reduce((a, h) => a + h, 0); for (let k = 0; k < i; k++) y += H[k]; return { x: 195 - W[i] / 2 + O[i], y, w: W[i], h: H[i] }; }
  renderVals() {
    const cl = (x) => Math.max(0, Math.min(1, x)), out = (x) => 1 - Math.pow(1 - cl(x), 3), ease = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    const st = this.state, now = performance.now(), n = this.P.length;
    const HH = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };
    const med = (q, W, H) => ({ s: Math.min(W / 520, H / HH[q.media]).toFixed(4), isPhone: q.media === 'phone', isTv: q.media === 'tv', isWeb: q.media === 'web', isDiscord: q.media === 'discord', isTerm: q.media === 'term', isData: q.media === 'data', isRepo: q.media === 'repo', isPaper: q.media === 'paper', date: q.date || '', mins: q.mins || '', name: q.name, repo: q.repo || '', desc: q.desc });
    // finish whatever the book is doing
    if (st.turn && (this.reduced || now - st.turn.t0 > st.turn.dur)) { const tr = st.turn; this.state.turn = null; this.state.sp = tr.to; this.state.side = tr.to > tr.from ? 'L' : 'R'; this.state.pan = null; if (tr.then && tr.then !== this.state.side) { this.state.pan = { from: this.sx(this.state.side), t0: now }; this.state.side = tr.then; } }
    if (st.pan && now - st.pan.t0 > 450) this.state.pan = null;
    if (st.opening && (this.reduced || now - st.opening.t0 > 640)) { const i = st.opening.i; this.state.opening = null; Object.assign(this.state, { screen: 'book', vol: i, sp: -1, side: 'R', pan: null, turn: this.reduced ? null : { from: -1, to: 0, t0: now, dur: 1050, x0: 25 } }); if (this.reduced) Object.assign(this.state, { sp: 0, side: 'L' }); }
    if (st.closing && (this.reduced || now - st.closing.t0 > 320)) { this.state.closing = null; this.state.screen = 'shelf'; this.state.back0 = now; }
    const p = this.P[st.pi], nx = this.P[(st.pi + 1) % n];
    const secs = (p.sections || []).map((s, i) => ({ ...s, kind: s.kind || 'text', id: this.uid + 's' + i, hasFig: !!s.fig, fig: s.fig || '', isSystems: s.kind === 'systems', isStatus: s.kind === 'status', items: (s.items || []).map((it) => ({ ...it, mh: (parseInt(it.vh, 10) * 0.5767).toFixed(0) + 'px' })), cols: s.cols || [], col: i === st.cur ? '#EDEDED' : '#8A8A93', jump: () => { const el = document.getElementById(this.uid + 's' + i), sc = document.querySelector('[data-mscroll="' + this.uid + 'p"]'); if (el && sc) sc.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' }); this.setState({ tocOpen: false }); } }));
    const vis = this.P.map((q, i) => i).filter((i) => (st.filt == null || this.KINDS[st.filt + 1][2].indexOf(this.P[i].type) >= 0) && (!st.q.trim() || (this.P[i].name + ' ' + this.P[i].type + ' ' + (this.P[i].stack || []).join(' ')).toLowerCase().indexOf(st.q.trim().toLowerCase()) >= 0));
    const v = this.V[st.vol], blank = { kind: 'end', vol: v.n, nextVol: '', nextTitle: '' }, pg = (i) => v.all[i] || blank;
    const sh = (g) => (0.42 * (1 - Math.cos(g)) / 2).toFixed(3), shb = (g) => (0.06 + 0.26 * (1 + Math.cos(g)) / 2).toFixed(3);
    const bk = { tone: v.tone, ink: v.ink, n: v.n, title: v.title, cfs: v.title.length > 9 ? '54px' : '64px', x: (this.camX() - 340).toFixed(1) + 'px', castL: 0, castR: 0, castLW: '0px', castLX: '0px', castRW: '0px' };
    const tr = st.turn;
    if (tr) {
      const e = ease((now - tr.t0) / tr.dur), fwd = tr.to > tr.from, a = fwd ? tr.from : tr.to, b = fwd ? tr.to : tr.from;
      // the leaf is the sheet between spreads a and b: its front is a's right page, its back b's left page (or the cover and the contents)
      const cov = a < 0, ang = fwd ? -180 * e : -180 * (1 - e), lift = Math.sin(Math.PI * e), bend = lift * (cov ? 3 : 6.5) * (fwd ? 1 : -1);
      Object.assign(bk, { isCover: cov, notCover: !cov, A: cov ? blank : pg(2 * a + 1), B: pg(2 * b), L: cov ? blank : pg(2 * a), R: pg(2 * b + 1), lVis: cov ? 'hidden' : 'visible', leafVis: 'visible' });
      for (let k = 1; k <= 6; k++) { const g = (ang + (k - 1) * bend) * Math.PI / 180; bk['t' + k] = k === 1 ? `translateZ(${(lift * 8).toFixed(2)}px) rotateY(${ang.toFixed(3)}deg)` : `rotateY(${bend.toFixed(3)}deg)`; bk['s' + k + 'a'] = sh(g); bk['s' + k + 'b'] = shb(g); }
      // its shadow falls on whichever page it is over
      const c = Math.cos(ang * Math.PI / 180) * 340;
      if (c > 0) Object.assign(bk, { castR: (lift * 0.9).toFixed(3), castRW: Math.round(c + 50) + 'px' }); else Object.assign(bk, { castL: cov ? 0 : (lift * 0.9).toFixed(3), castLW: Math.round(-c + 50) + 'px', castLX: Math.round(340 + c - 50) + 'px' });
    } else {
      const closed = st.sp < 0;
      Object.assign(bk, { isCover: closed, notCover: !closed, A: blank, B: pg(0), L: closed ? blank : pg(2 * st.sp), R: pg(2 * Math.max(0, st.sp) + 1), lVis: closed ? 'hidden' : 'visible', leafVis: closed ? 'visible' : 'hidden' });
      for (let k = 1; k <= 6; k++) { bk['t' + k] = 'none'; bk['s' + k + 'a'] = 0; bk['s' + k + 'b'] = 0; }
    }
    // the page block gets thinner on the right and thicker on the left as you read
    const spreads = v.all.length / 2, readF = Math.max(0, st.sp) / Math.max(1, spreads - 1);
    Object.assign(bk, { lEdgeW: (2 + 4 * readF).toFixed(1) + 'px', lEdgeL: (-(2 + 4 * readF)).toFixed(1) + 'px', rEdgeW: (6 - 4 * readF).toFixed(1) + 'px' });
    const pgi = tr ? (tr.to > tr.from ? 2 * tr.to + (tr.then === 'R' ? 1 : 0) : 2 * tr.to + (tr.then === 'L' ? 0 : 1)) : Math.max(0, st.sp) * 2 + (st.side === 'R' ? 1 : 0);
    const atFirst = st.sp <= 0 && st.side === 'L', atLast = st.sp >= spreads - 1 && st.side === 'R';
    // keyboard: the real one's height on a phone, a stand-in on the canvas
    const vv = window.visualViewport, root = document.querySelector('[data-mob="' + this.uid + '"]'), kk = root ? root.getBoundingClientRect().width / 390 : 1;
    const realKb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) / kk : 0, useSim = realKb < 80;
    const kbH = st.kb ? (useSim ? 291 : realKb) : 0;
    let dy = 0;
    if (st.kb && this.kbField) { const f = this.kbField; dy = Math.min(0, 844 - kbH - 18 - f.bottom); if (f.top + dy < 70) dy = Math.min(0, 70 - f.top); }
    this.kbDy = dy;
    const cO = st.closing ? out((now - st.closing.t0) / 320) : 0;
    Object.assign(bk, { dy: dy.toFixed(1) + 'px', ctlOp: st.kb ? 0 : 1, ctlPe: st.kb ? 'none' : 'auto', op: (1 - cO).toFixed(3), drop: (14 * cO).toFixed(1) + 'px',
      head: 'Vol. ' + v.n + ' · ' + v.title, pos: (pgi + 1) + ' / ' + v.all.length, prevC: atFirst ? '#3a3a42' : '#EDEDED', nextC: atLast ? '#3a3a42' : '#EDEDED' });
    const kbd = { y: st.kb && useSim ? '0px' : '100%', vis: useSim ? 'visible' : 'hidden', r1: [0,1,2,3,4,5,6,7,8,9], r2: [0,1,2,3,4,5,6,7,8], r3: [0,1,2,3,4,5,6] };
    // the stack, and the volume on its way out of it
    const op = st.opening, ot = op ? (now - op.t0) : 0;
    const pull = op ? out(ot / 140) : 0, mk = op ? ease((ot - 140) / 500) : 0;
    const back = st.back0 ? out((now - st.back0) / 380) : 1;
    const stk = { op: (op ? 1 - out((ot - 100) / 300) : back).toFixed(3), hintOp: 1 };
    let mo = { on: false };
    if (op) { const r = this.stackRect(op.i), V0 = this.V[op.i], T = { x: 25, y: 92, w: 340, h: 486 }, L = (p, q) => p + (q - p) * mk;
      mo = { on: ot > 140, x: L(r.x + 14, T.x).toFixed(1) + 'px', y: L(r.y, T.y).toFixed(1) + 'px', w: L(r.w, T.w).toFixed(1) + 'px', h: L(r.h, T.h).toFixed(1) + 'px', tone: V0.tone, ink: V0.ink, n: V0.n, title: V0.title, cfs: V0.title.length > 9 ? '54px' : '64px', cs: (L(r.w, T.w) / 420).toFixed(4), cop: cl((mk - 0.55) / 0.45).toFixed(3), sop: (1 - cl(mk / 0.3)).toFixed(3), sh: (0.45 * mk).toFixed(3) }; }
    const tabIdx = { wall: 0, index: 1, project: st.from === 'index' ? 1 : 0, shelf: 2, book: st.vol === this.V.length - 1 ? 3 : 2 }[st.screen];
    const fo = this.reduced ? 1 : out((now - st.swapAt) / 380);
    const wallItems = this.WALL_ORDER.map((i) => i);
    const wf = Math.max(0, Math.min(wallItems.length - 1, this.wf || 0)), focus = Math.round(wf);
    return {
      uid: this.uid, sc: { wall: st.screen === 'wall', index: st.screen === 'index', project: st.screen === 'project', shelf: st.screen === 'shelf', book: st.screen === 'book' },
      dotsY: '0px',
      wall: wallItems.map((i, k) => { const q = this.P[i], d = k - wf, ad = Math.abs(d), ang = Math.max(-2.6, Math.min(2.6, d)) * 30; return { name: q.name, ml: [med(q, 300, 220)], h: Math.round(HH[q.media] * Math.min(300 / 520, 220 / HH[q.media])) + 'px', y: (340 + 390 * Math.sin(ang * Math.PI / 180)).toFixed(1) + 'px', rx: (-ang).toFixed(2), sc: (1 - 0.08 * ad).toFixed(4), op: Math.max(0, 1 - 0.5 * ad).toFixed(3), vis: ad < 2 ? 'visible' : 'hidden', z: 20 - Math.round(ad * 4) }; }),
      wallHits: wallItems.map((i, k) => ({ aria: this.P[i].name + ', ' + this.P[i].type, tap: (e) => { if (k === Math.round(this.wf || 0)) this.openProject(i); else { const sc = document.querySelector('[data-mscroll="' + this.uid + 'w"]'); if (sc) sc.scrollTo({ top: k * 180, behavior: this.reduced ? 'auto' : 'smooth' }); } }, focus: () => { const sc = document.querySelector('[data-mscroll="' + this.uid + 'w"]'); if (sc && Math.round(this.wf || 0) !== k) sc.scrollTo({ top: k * 180, behavior: this.reduced ? 'auto' : 'smooth' }); } })),
      onWallScroll: (e) => { this.wf = e.currentTarget.scrollTop / 180; },
      rail: wallItems.map((i, k) => ({ w: k === focus ? '14px' : '6px', c: k === focus ? '#EDEDED' : '#3a3a42' })),
      cap: (() => { const q = this.P[wallItems[focus]]; return { n: String(focus + 1).padStart(2, '0') + ' / ' + wallItems.length, name: q.name, type: q.type, op: Math.max(0.25, 1 - 1.5 * Math.abs(wf - focus)).toFixed(3) }; })(),
      kinds: this.KINDS.map((k, gi) => ({ aria: k[0], icon: this.ICON[k[1]], n: String(gi === 0 ? n : this.P.filter((q) => k[2].indexOf(q.type) >= 0).length), on: (gi === 0 ? st.filt == null : st.filt === gi - 1) ? 'true' : 'false', col: (gi === 0 ? st.filt == null : st.filt === gi - 1) ? '#EDEDED' : '#5a5a63', pick: () => this.setState({ filt: gi === 0 ? null : gi - 1 }) })),
      kindX: (((st.filt == null ? 0 : st.filt + 1) * ((346 - 46) / 6)) + 15) + 'px', kindName: st.filt == null ? 'All projects' : this.KINDS[st.filt + 1][0],
      countText: vis.length === n ? String(n) : vis.length + ' / ' + n, q: st.q, setQ: (e) => this.setState({ q: e.target.value }),
      rows: vis.map((i) => { const q = this.P[i]; return { name: q.name, stack: q.topic || q.stackText || (q.stack || []).join(' · '), icon: this.ICON[this.TI[q.type]], ml: [med(q, 64, 40)], op: 1, open: () => this.openProject(i) }; }),
      p, nx: { name: nx.name }, cf: fo.toFixed(3), heroL: [med(p, 346, 240)], heroH: Math.round(HH[p.media] * Math.min(346 / 520, 240 / HH[p.media]) + 28) + 'px',
      logos: (p.stack || []).map((s) => this.LOGO[s]).filter(Boolean), stackText: p.stackText || (p.stack || []).filter((s) => !this.LOGO[s]).join(' · '),
      links: (p.links || []).slice(0, 1), isCase: p.depth === 'case',
      details: (() => { const o = p.post ? [] : [{ label: 'Platform', v: (p.facts.find((f) => f.k === 'Platform') || {}).v || p.type, icon: this.ICON[this.TI[p.type]] }]; p.facts.forEach((f) => { if (f.k === 'Platform') return; if (f.k === 'Status') { const s = (f.v || '').toLowerCase(); o.push({ label: 'Status', v: f.v, dot: /live|shipped/.test(s) ? '#4ADE80' : /pre-launch|prototype|beta/.test(s) ? '#F0B45A' : '#61616A', status: true }); return; } o.push({ label: f.k, v: f.v, icon: this.FICON[this.FI[f.k] || 'target'] }); }); return o.map((d) => ({ ...d, iconDisp: d.status ? 'none' : 'block', dotDisp: d.status ? 'block' : 'none', icon: d.icon || '', dot: d.dot || 'transparent' })); })(),
      sections: secs, hasToc: secs.length > 1, tocOpen: st.tocOpen ? 'true' : 'false', tocHidden: st.tocOpen ? 'false' : 'true', tocY: st.tocOpen ? '0px' : '110%',
      ticks: secs.map((s, i) => ({ w: i === st.cur ? '20px' : '12px', c: i === st.cur ? '#EDEDED' : '#4a4a52' })),
      toggleToc: () => this.setState({ tocOpen: !this.state.tocOpen }),
      onProjScroll: (e) => { const sc = e.currentTarget; let c = 0; secs.forEach((s, i) => { const el = document.getElementById(s.id); if (el && el.offsetTop - 300 <= sc.scrollTop) c = i; }); if (c !== this.state.cur) this.setState({ cur: c }); },
      goNext: () => this.openProject((st.pi + 1) % n),
      books: this.V.map((b, i) => { const r = this.stackRect(i), me = op && op.i === i; return { n: b.n, title: b.title, tone: b.tone, ink: b.ink, x: r.x + 'px', y: r.y + 'px', w: r.w + 'px', h: r.h + 'px', fs: r.h < 50 ? '15px' : '17px', tx: (me ? 14 * pull : 0).toFixed(1) + 'px', op: me && ot > 140 ? 0 : 1, aria: 'Volume ' + b.n + ': ' + b.title, open: () => this.openVol(i) }; }),
      mo, stk, kbd,
      swDown: (e) => { if (/^(INPUT|TEXTAREA|BUTTON|A)$/.test(e.target.tagName)) { this.sw = null; return; } this.sw = { x: e.clientX, y: e.clientY }; },
      swUp: (e) => { const s0 = this.sw; this.sw = null; if (!s0) return; const dx = e.clientX - s0.x, dy2 = e.clientY - s0.y; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy2) * 1.4) { if (dx < 0) this.next(); else this.prev(); } },
      goPage: (i) => this.goPage(i), nextVol: () => { if (st.vol < this.V.length - 1) { this.setState({ screen: 'shelf' }); this.openVol(st.vol + 1); } },
      bk, clock: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }),
      form: { ...st.form, ready: !!(st.form.name.trim() && st.form.msg.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.form.mail.trim())) },
      setField: (k, val) => this.setState({ form: { ...this.state.form, [k]: val } }),
      shelve: () => { this.setState({ form: { ...this.state.form, msg: '' } }); this.closeBook(); },
      prevPage: () => this.prev(), nextPage: () => this.next(),
      showBack: st.screen === 'project' || st.screen === 'book', backLabel: st.screen === 'book' ? 'Close' : 'Back',
      back: () => st.screen === 'book' ? this.closeBook() : this.go(st.from),
      barY: st.screen === 'project' || st.screen === 'book' ? '100%' : '0px',
      tabs: ['Wall', 'Index', 'About', 'Contact'].map((label, i) => ({ label, cur: i === tabIdx ? 'page' : 'false', col: i === tabIdx ? '#EDEDED' : '#8A8A93', go: () => i === 0 ? this.go('wall') : i === 1 ? this.go('index') : i === 2 ? this.go('shelf') : this.openVol(this.V.length - 1) })),
      tabX: (12 + (366 / 4) * tabIdx + (366 / 4 - 26) / 2).toFixed(1) + 'px'
    };
  }
}
</script>
</body>
</html>
'''
js=(T.replace('__P__',json.dumps(P,ensure_ascii=False)).replace('__L__',json.dumps(L,separators=(',',':'))).replace('__I__',json.dumps(ICON))
     .replace('__TI__',json.dumps(TI)).replace('__FI__',json.dumps(FI)).replace('__FICON__',json.dumps(FICON)).replace('__K__',json.dumps(KINDS))
     .replace('__VOL__',"    const L = '#EDEDED', D = '#0a0a0c';\n    const ph = (o) => ({ kind: 'org', eyebrow: 'TRAINING ARC', org: o, roles: [{ title: '[Role]', dates: '[Start] – [End]', desc: '[What you did and what came of it, in a sentence or two.]' }] });\n"+VOL+"\n    this.WALL_ORDER = [0, 2, 4, 13, 1, 8, 14, 3, 10, 7, 15, 9, 12, 5, 16, 11, 6];"))
open(SP+'final/project/Mobile.dc.html','w').write(js)
print(len(js))
