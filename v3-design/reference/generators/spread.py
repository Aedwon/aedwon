import json,sys
sys.path.insert(0,'/tmp/claude-0/-home-claude/b086297c-46b7-58c4-b54f-622f0b217526/scratchpad/gen')
from projects import P
SP='/tmp/claude-0/-home-claude/b086297c-46b7-58c4-b54f-622f0b217526/scratchpad/'
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
ICON={'phone':"M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5zM11 18.5h2",
 'tv':"M3.5 5h17a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8.5 21h7M12 17.5V21",
 'bot':"M12 2.5v3.5M7 6h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3zM9.5 11.5v2M14.5 11.5v2M1.5 11.5v3M22.5 11.5v3",
 'web':"M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 9h19M5.5 6.75h.01M8 6.75h.01",
 'redesign':"M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 9h19M8.5 9v10.5M11.5 12.5h6.5M11.5 15.5h4",
 'civic':"M2.5 21h19M4.5 18h15M6 18v-6.5M10 18v-6.5M14 18v-6.5M18 18v-6.5M3.5 11.5h17L12 4z",
 'term':"M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM7 9.5l3 2.5-3 2.5M12.5 15h4.5",
 'data':"M3.5 20.5h17M6.5 17v-5M11 17V6.5M15.5 17v-8M20 17v-3.5",
 'repo':"M6 3v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18 9a9 9 0 0 1-9 9",
 'pen':"M4 20.5h4.5L19.5 9.5a2.1 2.1 0 0 0-3-3L5.5 17.5 4 20.5zM14.5 8.5l1 1"}
TI={'Mobile app':'phone','Android TV':'tv','Discord bot':'bot','Website redesign':'redesign','Web tool':'web','Civic tech':'civic','Developer tooling':'term','Data system':'data','Open source':'repo','Writing':'pen'}

def stage(listkey, h, scale, extra=''):
    return f'''<sc-for list="{{{{ {listkey} }}}}" as="v" hint-placeholder-count="1">
<div style="position: relative; height: {h}; border-radius: 12px; background: #131317; overflow: hidden{extra}">
<div style="position: absolute; left: 50%; top: 50%; width: 520px; translate: -50% -50%; scale: {{{{ v.s }}}}">
{TB}
</div>
</div>
</sc-for>'''

def figs(w):
    return f'''<sc-if value="{{{{ s.hasFig }}}}" hint-placeholder-val="{{{{ false }}}}">
<figure style="margin: 10px 0 0; display: flex; flex-direction: column; gap: 10px">
<div style="height: 360px; border-radius: 12px; background: #111114; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c; text-align: center; padding: 0 24px">{{{{ s.fig }}}}</div>
<figcaption style="font-size: 13.5px; color: #8A8A93">[Caption: what this shows.]</figcaption>
</figure>
</sc-if>'''

LOGOS='''<div aria-label="{{ stackAria }}" style="display: flex; align-items: center; gap: 16px; min-height: 22px">
<sc-for list="{{ logos }}" as="g" hint-placeholder-count="3"><span title="{{ g.t }}" style="display: flex; flex: none"><svg class="lg" width="{{ g.w }}" height="{{ g.h }}" viewBox="{{ g.vb }}" role="img" aria-label="{{ g.t }}" style="--b: {{ g.c }}"><path d="{{ g.d }}"></path></svg></span></sc-for>
<span style="font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #A1A1AA">{{ stackText }}</span>
</div>'''
LINKS='''<div style="display: flex; flex-wrap: wrap; gap: 8px 22px">
<sc-for list="{{ links }}" as="l" hint-placeholder-count="2"><a class="ul" href="{{ l.href }}" style="font-size: 15px; color: #EDEDED">{{ l.label }} ↗</a></sc-for>
</div>'''
KIND='''<span style="display: inline-flex; align-items: center; gap: 10px; font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #A1A1AA"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ kindIcon }}"></path></svg>{{ p.type }}</span>'''
POINTS='''<sc-if value="{{ isCase }}" hint-placeholder-val="{{ false }}">
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px">
<sc-for list="{{ p.points }}" as="k" hint-placeholder-count="3"><div style="display: flex; flex-direction: column; gap: 10px; padding-top: 16px; border-top: 1px solid #2a2a30"><span style="font-size: 17px; font-weight: 600">{{ k.h }}</span><span style="font-size: 15px; line-height: 1.6; color: #A1A1AA">{{ k.p }}</span></div></sc-for>
</div>
</sc-if>'''
def SECTIONS(cols):
    # cols: True = heading beside the text (A); False = stacked (B, C)
    if cols:
        row='display: grid; grid-template-columns: 300px minmax(0, 640px); gap: 40px'
    else:
        row='display: flex; flex-direction: column; gap: 16px'
    return f'''<sc-for list="{{{{ sections }}}}" as="s" hint-placeholder-count="3">
<section id="{{{{ s.id }}}}" style="{row}; padding-top: 52px">
<h2 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #EDEDED">{{{{ s.h }}}}</h2>
<div style="display: flex; flex-direction: column; gap: 16px; font-size: 17px; line-height: 1.75; color: #A1A1AA">
<sc-for list="{{{{ s.p }}}}" as="para" hint-placeholder-count="2"><p style="margin: 0">{{{{ para }}}}</p></sc-for>
{figs(0)}
</div>
</section>
</sc-for>
<sc-if value="{{{{ isCase }}}}" hint-placeholder-val="{{{{ false }}}}">
<div style="{row}; padding-top: 52px">
<span style="font-size: 15px; color: #8A8A93">Also in the case study</span>
<div style="display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; flex-direction: column">
<sc-for list="{{{{ p.more }}}}" as="m" hint-placeholder-count="4"><span style="padding: 12px 0; border-top: 1px solid #1f1f24; font-size: 17px; color: #D4D4D8">{{{{ m }}}}</span></sc-for>
</div>
<a class="cta" href="#" style="align-self: flex-start; display: inline-flex; align-items: center; gap: 10px; height: 48px; padding: 0 18px; border-radius: 10px; background: #EDEDED; color: #0a0a0c; font-size: 15px; font-weight: 600; text-decoration: none">{{{{ p.caseLabel }}}} <span aria-hidden="true">→</span></a>
</div>
</div>
</sc-if>'''
NEXT='''<button class="nx" type="button" onClick="{{ goNext }}" style="width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 32px; align-items: center; padding: 28px 0 0; border: none; border-top: 1px solid #1f1f24; background: none; color: inherit; font-family: inherit; text-align: left; cursor: pointer">
<span style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 14px; color: #8A8A93">Next project</span><span style="font-size: 32px; font-weight: 600; letter-spacing: -0.03em">{{ nx.name }} <span class="go" aria-hidden="true" style="display: inline-block; color: #8A8A93">→</span></span><span style="font-size: 15px; line-height: 1.55; color: #A1A1AA">{{ nx.desc }}</span></span>
''' + stage('nxL','130px','0.36') + '''
</button>'''

head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Project page — three structures</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>
body{margin:0}
.ps{scrollbar-width:none}.ps::-webkit-scrollbar{width:0}
.ul{text-decoration:underline;text-underline-offset:4px;text-decoration-color:#4a4a52;transition:text-decoration-color .2s ease}
.ul:hover{text-decoration-color:#EDEDED}
.lg path{fill:#8A8A93;transition:fill .3s ease}
.lg:hover path,.stackrow:hover .lg path{fill:var(--b)}
.nx .go{transition:translate .35s cubic-bezier(.34,1.56,.64,1),color .2s ease}
.nx:hover .go{translate:4px 0;color:#EDEDED}
.tb{border:none;background:none;padding:0;font-family:inherit;cursor:pointer;color:#A1A1AA;transition:color .2s ease}
.tb:hover{color:#EDEDED}
.toc{border:none;background:none;padding:6px 0;font-family:inherit;font-size:14.5px;text-align:left;cursor:pointer;color:#8A8A93;transition:color .2s ease}
.toc:hover{color:#EDEDED}
.cta{transition:background-color .2s ease}.cta:hover{background:#ffffff}
a:focus-visible,button:focus-visible{outline:2px solid #EDEDED;outline-offset:3px}
</style>
</helmet>
<div data-pp="{{ uid }}" style="position: relative; width: 1440px; height: 900px; overflow: hidden; background: #0a0a0c; color: #EDEDED; font-family: 'Geist', system-ui, sans-serif; -webkit-font-smoothing: antialiased">
'''
nav='''<!-- nav -->
<div style="position: absolute; left: 0; right: 0; top: 0; height: 84px; padding: 0 56px; display: flex; justify-content: space-between; align-items: center; background: rgba(10,10,12,0.78); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); z-index: 5">
<span style="font-size: 16px; font-weight: 600; letter-spacing: -0.02em">Aedwon</span>
<div style="display: flex; align-items: center; gap: 36px; font-size: 14px; color: #8A8A93"><span style="color: #EDEDED">Wall</span><span>Index</span><span style="width: 1px; height: 16px; background: #2a2a30"></span><span>About</span><span>Contact</span></div>
</div>
'''
# ---------- A · placard
A='''<sc-if value="{{ lay.a }}" hint-placeholder-val="{{ true }}">
<div class="ps" data-pscroll="{{ uid }}" style="position: absolute; inset: 0; overflow-y: auto">
<div style="padding: 116px 120px 96px; opacity: {{ cf.op }}; translate: 0 {{ cf.y }}">
<button class="tb" type="button" onClick="{{ goBack }}" style="font-size: 14px; height: 36px; margin-bottom: 16px">{{ backText }}</button>
''' + stage('heroL','540px','1.55') + '''
<!-- the placard: what a museum puts beside the piece -->
<div style="display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 72px; padding-top: 44px">
<div style="display: flex; flex-direction: column; gap: 18px">
''' + KIND + '''
<h1 style="margin: 0; font-size: 60px; font-weight: 600; letter-spacing: -0.045em; line-height: 1">{{ p.name }}</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.55; color: #A1A1AA; max-width: 660px">{{ p.desc }}</p>
</div>
<div class="stackrow" style="display: flex; flex-direction: column; gap: 22px; padding-top: 6px">
<dl style="margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px">
<sc-for list="{{ p.facts }}" as="f" hint-placeholder-count="4"><div style="display: flex; flex-direction: column; gap: 5px"><dt style="font-size: 13px; color: #8A8A93">{{ f.k }}</dt><dd style="margin: 0; font-size: 15px; line-height: 1.4">{{ f.v }}</dd></div></sc-for>
</dl>
''' + LOGOS + LINKS + '''
</div>
</div>
<div style="padding-top: 56px">''' + POINTS + '''</div>
''' + SECTIONS(True) + '''
<div style="padding-top: 96px">''' + NEXT + '''</div>
</div>
</div>
</sc-if>
'''
# ---------- B · spread
B='''<sc-if value="{{ lay.b }}" hint-placeholder-val="{{ false }}">
<!-- left page: stays put -->
<div class="stackrow" style="position: absolute; left: 56px; top: 116px; bottom: 40px; width: 400px; display: flex; flex-direction: column; gap: 20px; opacity: {{ cf.op }}">
<button class="tb" type="button" onClick="{{ goBack }}" style="align-self: flex-start; font-size: 14px; height: 32px">{{ backText }}</button>
''' + KIND + '''
<h1 style="margin: 0; font-size: 48px; font-weight: 600; letter-spacing: -0.045em; line-height: 1">{{ p.name }}</h1>
<p style="margin: 0; font-size: 16.5px; line-height: 1.6; color: #A1A1AA">{{ p.desc }}</p>
<dl style="margin: 0; display: flex; flex-direction: column">
<sc-for list="{{ p.facts }}" as="f" hint-placeholder-count="4"><div style="display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1px solid #1f1f24"><dt style="font-size: 13.5px; color: #8A8A93">{{ f.k }}</dt><dd style="margin: 0; font-size: 14px; text-align: right">{{ f.v }}</dd></div></sc-for>
</dl>
''' + LOGOS + LINKS + '''
<sc-if value="{{ hasToc }}" hint-placeholder-val="{{ false }}">
<nav aria-label="On this page" style="display: flex; flex-direction: column; padding-top: 4px">
<sc-for list="{{ sections }}" as="s" hint-placeholder-count="3"><button class="toc" type="button" onClick="{{ s.jump }}">{{ s.h }}</button></sc-for>
</nav>
</sc-if>
<div style="margin-top: auto; display: flex; justify-content: space-between; gap: 16px; font-size: 14px">
<button class="tb" type="button" onClick="{{ goPrev }}" style="font-size: 14px; text-align: left">← {{ pv.name }}</button>
<button class="tb" type="button" onClick="{{ goNext }}" style="font-size: 14px; text-align: right">{{ nx.name }} →</button>
</div>
</div>
<!-- right page: the work, and the story if there is one -->
<div class="ps" data-pscroll="{{ uid }}" style="position: absolute; left: 520px; right: 0; top: 0; bottom: 0; overflow-y: auto">
<div style="padding: 116px 56px 96px 0; opacity: {{ cf.op }}; translate: 0 {{ cf.y }}">
''' + stage('heroL','520px','1.25') + '''
<sc-if value="{{ isNote }}" hint-placeholder-val="{{ false }}">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 16px">
<div style="height: 300px; border-radius: 12px; background: #111114; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c">[a detail]</div>
<div style="height: 300px; border-radius: 12px; background: #111114; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c">[another detail]</div>
</div>
</sc-if>
<div style="padding-top: 48px">''' + POINTS.replace('repeat(3, minmax(0, 1fr))','repeat(3, minmax(0, 1fr))') + '''</div>
<div style="max-width: 680px">''' + SECTIONS(False) + '''</div>
</div>
</div>
</sc-if>
'''
# ---------- C · sheet over the wall
C='''<sc-if value="{{ lay.c }}" hint-placeholder-val="{{ false }}">
<!-- the wall stays where you left it, just behind -->
<div aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"><dc-import name="WallIndex2" bare="{{ true }}" view="wall" hint-size="1440px,900px"></dc-import></div>
<div aria-hidden="true" onClick="{{ reopen }}" style="position: absolute; inset: 0; background: rgba(10,10,12,{{ sh.dim }}); cursor: {{ sh.cur }}"></div>
<div role="dialog" aria-label="{{ p.name }}" style="position: absolute; left: 40px; right: 40px; top: 96px; bottom: 0; background: #0f0f12; border: 1px solid #222228; border-bottom: none; border-radius: 16px 16px 0 0; overflow: hidden; translate: 0 {{ sh.y }}; box-shadow: 0 -30px 80px rgba(0,0,0,.5)">
<div style="position: absolute; left: 0; right: 0; top: 0; height: 64px; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1c1c22; background: rgba(15,15,18,.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); z-index: 2">
<div style="display: flex; align-items: center; gap: 16px; opacity: {{ cf.op }}">''' + KIND.replace('{{ p.type }}','') + '''<span style="font-size: 16px; font-weight: 600">{{ p.name }}</span><span style="font-family: 'Geist Mono', monospace; font-size: 12px; color: #61616A">{{ posText }}</span></div>
<div style="display: flex; align-items: center; gap: 6px">
<button class="tb" type="button" onClick="{{ goPrev }}" aria-label="Previous project" style="width: 40px; height: 40px; font-size: 16px">←</button>
<button class="tb" type="button" onClick="{{ goNext }}" aria-label="Next project" style="width: 40px; height: 40px; font-size: 16px">→</button>
<span style="width: 1px; height: 18px; background: #26262c; margin: 0 8px"></span>
<button class="tb" type="button" onClick="{{ close }}" aria-label="Close" style="height: 40px; padding: 0 6px; font-size: 14px">Close</button>
</div>
</div>
<div class="ps" data-pscroll="{{ uid }}" style="position: absolute; left: 0; right: 0; top: 64px; bottom: 0; overflow-y: auto">
<div style="max-width: 1040px; margin: 0 auto; padding: 40px 0 96px; opacity: {{ cf.op }}; translate: {{ cf.x }} 0">
<div class="stackrow" style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 56px; padding-bottom: 36px">
<div style="display: flex; flex-direction: column; gap: 16px">
<h1 style="margin: 0; font-size: 52px; font-weight: 600; letter-spacing: -0.045em; line-height: 1">{{ p.name }}</h1>
<p style="margin: 0; font-size: 18.5px; line-height: 1.55; color: #A1A1AA">{{ p.desc }}</p>
</div>
<div style="display: flex; flex-direction: column; gap: 18px; padding-top: 8px">''' + LOGOS + LINKS + '''</div>
</div>
''' + stage('heroL','500px','1.4') + '''
<dl style="margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 18px 28px; padding: 24px 0; border-bottom: 1px solid #1f1f24">
<sc-for list="{{ p.facts }}" as="f" hint-placeholder-count="4"><div style="display: flex; flex-direction: column; gap: 5px"><dt style="font-size: 13px; color: #8A8A93">{{ f.k }}</dt><dd style="margin: 0; font-size: 15px">{{ f.v }}</dd></div></sc-for>
</dl>
<div style="padding-top: 40px">''' + POINTS + '''</div>
<div style="max-width: 720px">''' + SECTIONS(False) + '''</div>
</div>
</div>
</div>
</sc-if>
'''
tail='''
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"layout":{"editor":"enum","options":["placard","spread","sheet"],"default":"placard"},"project":{"editor":"text","default":"qr"},"$preview":{"width":1440,"height":900}}'>
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.uid = 'pp' + Math.floor(Math.random() * 1e9);
    this.P = __P__;
    this.LOGO = __L__;
    this.ICON = __I__; this.TI = __TI__;
    const i = this.P.findIndex((p) => p.id === props.project);
    this.state = { tick: 0, pi: i < 0 ? 0 : i, swapAt: -1e9, dir: 1, open: true, openAt: performance.now() };
  }
  componentDidMount() {
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.onKey = (e) => {
      if (e.key === 'ArrowRight') this.go(1); else if (e.key === 'ArrowLeft') this.go(-1);
      else if (e.key === 'Escape' && this.props.layout === 'sheet') this.setState({ open: false, openAt: performance.now() });
    };
    window.addEventListener('keydown', this.onKey);
    const loop = () => { this.setState({ tick: this.state.tick + 1 }); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); window.removeEventListener('keydown', this.onKey); }
  go(d) {
    const n = this.P.length;
    this.setState({ pi: (this.state.pi + d + n) % n, swapAt: performance.now(), dir: d });
    const sc = document.querySelector('[data-pscroll="' + this.uid + '"]'); if (sc) sc.scrollTop = 0;
  }
  renderVals() {
    const cl = (x) => Math.max(0, Math.min(1, x)), out = (x) => 1 - Math.pow(1 - cl(x), 3);
    const now = performance.now(), st = this.state, n = this.P.length;
    const p = this.P[st.pi], nx = this.P[(st.pi + 1) % n], pv = this.P[(st.pi - 1 + n) % n];
    const lay = this.props.layout === 'spread' ? 'b' : this.props.layout === 'sheet' ? 'c' : 'a';
    const f = this.reduced ? 1 : out((now - st.swapAt) / 420);
    const so = this.reduced ? (st.open ? 1 : 0) : (st.open ? out((now - st.openAt) / 560) : 1 - out((now - st.openAt) / 420));
    const HH = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };
    const fit = (q, W, H) => Math.min((W - 140) / 520, (H - 80) / HH[q.media], 1.6).toFixed(4);
    const SZ = lay === 'b' ? [864, 520] : lay === 'c' ? [1040, 500] : [1200, 540];
    const media = (q, W, H) => ({ s: fit(q, W, H), isPhone: q.media === 'phone', isTv: q.media === 'tv', isWeb: q.media === 'web', isDiscord: q.media === 'discord', isTerm: q.media === 'term', isData: q.media === 'data', isRepo: q.media === 'repo', isPaper: q.media === 'paper', date: q.date || '', mins: q.mins || '', name: q.name, repo: q.repo || '', desc: q.desc });
    const secs = (p.sections || []).map((s, i) => ({ ...s, id: this.uid + 's' + i, hasFig: !!s.fig, fig: s.fig || '', jump: () => { const el = document.getElementById(this.uid + 's' + i); const sc = document.querySelector('[data-pscroll="' + this.uid + '"]'); if (el && sc) sc.scrollTo({ top: el.offsetTop - 100, behavior: this.reduced ? 'auto' : 'smooth' }); } }));
    return {
      uid: this.uid, p, nx: { name: nx.name, desc: nx.desc }, pv: { name: pv.name },
      heroL: [media(p, SZ[0], SZ[1])], nxL: [media(nx, 220, 130)],
      lay: { a: lay === 'a', b: lay === 'b', c: lay === 'c' },
      kindIcon: this.ICON[this.TI[p.type]],
      logos: (p.stack || []).map((s) => this.LOGO[s]).filter(Boolean),
      stackText: p.stackText || (p.stack || []).filter((s) => !this.LOGO[s]).join(' \\u00b7 '),
      stackAria: 'Built with ' + ((p.stack || []).join(', ') || p.stackText || ''),
      links: p.links || [],
      sections: secs, hasToc: secs.length > 1,
      isCase: p.depth === 'case', isNote: p.depth === 'note',
      posText: String(st.pi + 1).padStart(2, '0') + ' / ' + n,
      cf: { op: f.toFixed(3), y: ((1 - f) * 14).toFixed(1) + 'px', x: ((1 - f) * 28 * st.dir).toFixed(1) + 'px' },
      sh: { y: ((1 - so) * 820).toFixed(1) + 'px', dim: (0.62 * so).toFixed(3), cur: st.open ? 'default' : 'pointer' },
      goNext: () => this.go(1), goPrev: () => this.go(-1),
      goBack: () => {}, close: () => this.setState({ open: false, openAt: performance.now() }),
      reopen: () => { if (!this.state.open) this.setState({ open: true, openAt: performance.now() }); }
    };
  }
}
</script>
</body>
</html>
'''
js=tail.replace('__P__',json.dumps(P,ensure_ascii=False)).replace('__L__',json.dumps(L,separators=(',',':'))).replace('__I__',json.dumps(ICON)).replace('__TI__',json.dumps(TI))


SEC2 = """<sc-for list="{{ sections }}" as="s" hint-placeholder-count="3">
<section id="{{ s.id }}" style="display: flex; flex-direction: column; gap: 16px; padding-top: 56px">
<h2 style="margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; color: #EDEDED">{{ s.h }}</h2>
<div style="display: flex; flex-direction: column; gap: 16px; max-width: 680px; font-size: 17px; line-height: 1.75; color: #A1A1AA">
<sc-for list="{{ s.p }}" as="para" hint-placeholder-count="2"><p style="margin: 0">{{ para }}</p></sc-for>
</div>
<sc-if value="{{ s.hasFig }}" hint-placeholder-val="{{ false }}">
<figure style="margin: 10px 0 0; display: flex; flex-direction: column; gap: 10px">
<div style="height: 380px; border-radius: 12px; background: #131317; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c; text-align: center; padding: 0 24px">{{ s.fig }}</div>
<figcaption style="font-size: 13.5px; color: #8A8A93">[Caption: what this shows.]</figcaption>
</figure>
</sc-if>
<sc-if value="{{ s.isSystems }}" hint-placeholder-val="{{ false }}">
<div style="display: flex; flex-direction: column; margin-top: 8px">
<sc-for list="{{ s.items }}" as="it" hint-placeholder-count="5">
<div style="display: flex; flex-direction: column; gap: 14px; padding: 40px 0; border-top: 1px solid #1c1c22">
<h3 style="margin: 0; font-size: 21px; font-weight: 600; letter-spacing: -0.02em; color: #EDEDED">{{ it.h }}</h3>
<div style="display: flex; flex-direction: column; gap: 12px; max-width: 680px; font-size: 15.5px; line-height: 1.7; color: #A1A1AA"><sc-for list="{{ it.p }}" as="q" hint-placeholder-count="2"><p style="margin: 0">{{ q }}</p></sc-for></div>
<div style="height: {{ it.vh }}; margin-top: 8px"><dc-import name="SystemViz" which="{{ it.which }}" hint-size="100%,370px"></dc-import></div>
</div>
</sc-for>
</div>
</sc-if>
<sc-if value="{{ s.isStatus }}" hint-placeholder-val="{{ false }}">
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 32px; font-size: 15px; line-height: 1.7; margin-top: 8px">
<sc-for list="{{ s.cols }}" as="col" hint-placeholder-count="3"><div style="display: flex; flex-direction: column; padding-top: 12px; border-top: 1px solid #2a2a30"><span style="font-size: 14px; color: #8A8A93; padding-bottom: 6px">{{ col.h }}</span><sc-for list="{{ col.items }}" as="li" hint-placeholder-count="4"><span style="color: #D4D4D8">{{ li }}</span></sc-for></div></sc-for>
</div>
<a class="ul" href="{{ s.link.href }}" style="align-self: flex-start; margin-top: 8px; font-size: 16px; color: #EDEDED">{{ s.link.label }}</a>
</sc-if>
</section>
</sc-for>"""


RAIL = """<!-- contents: hidden at the right edge as ticks, one per part (like the wall's rail). Come close and they open into names -->
<sc-if value="{{ hasToc }}" hint-placeholder-val="{{ false }}">
<nav class="rail" aria-label="On this page" style="position: absolute; right: 0; top: 50%; translate: 0 -50%; padding: 24px 22px 24px 60px; z-index: 6">
<div class="ticks" aria-hidden="true" style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px">
<sc-for list="{{ sections }}" as="s" hint-placeholder-count="5"><span style="display: block; height: 1.5px; width: {{ s.tw }}; background: {{ s.tc }}; border-radius: 1px; transition: width .45s cubic-bezier(.34,1.56,.64,1), background-color .3s ease"></span></sc-for>
</div>
<div class="railpanel" style="position: absolute; right: 14px; top: 50%; translate: 0 -50%; min-width: 230px; padding: 10px 6px; border-radius: 12px; background: rgba(17,17,20,.92); border: 1px solid #222228; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 24px 60px rgba(0,0,0,.5)">
<sc-for list="{{ sections }}" as="s" hint-placeholder-count="5"><button class="rl" type="button" onClick="{{ s.jump }}" aria-current="{{ s.cur }}" style="--c: {{ s.col }}">{{ s.h }}</button></sc-for>
</div>
</nav>
</sc-if>
"""

# ===================== B, cleaned up: a spread with an intuitive left page =====================
FI={'Published':'calendar','Reading time':'clock','Topic':'tag','Role':'person','Year':'calendar','Timeline':'calendar','Client':'building','Scale':'people','Ran for':'clock','Hosting':'server','Event':'flag','Contribution':'commit','For':'target','Runs':'browser'}
FICON={'person':"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0",
 'calendar':"M4 6.5h16v13.5H4zM4 10.5h16M8.5 4v4M15.5 4v4",
 'building':"M5 20.5V4.5h9v16M14 9.5h5v11M3 20.5h18M8 8h2.5M8 11.5h2.5M8 15h2.5",
 'people':"M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 14a6.5 6.5 0 0 1 3 6",
 'clock':"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
 'server':"M4 4.5h16v6H4zM4 13.5h16v6H4zM7.5 7.5h.01M7.5 16.5h.01",
 'flag':"M5 21V4M5 4.5h11l-2 4 2 4H5",
 'commit':"M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 12h5.5M15.5 12H21",
 'target':"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12h.01",
 'browser':"M3.5 4.5h17a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM2.5 9h19",
 'tag':"M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8zM8 8h.01"}
S2='''<!-- left page: stays put. Who it is, what it is, what it's made of; then the details as glanceable icons -->
<div style="position: absolute; left: 56px; top: 108px; bottom: 36px; width: 392px; display: flex; flex-direction: column; opacity: {{ cf.op }}">
<button class="tb" type="button" onClick="{{ goBack }}" style="align-self: flex-start; font-size: 14px; height: 32px; margin-bottom: 22px">{{ backText }}</button>
<h1 style="margin: 0; font-size: 46px; font-weight: 600; letter-spacing: -0.045em; line-height: 1.02">{{ p.name }}</h1>
<p style="margin: 16px 0 0; font-size: 16.5px; line-height: 1.6; color: #A1A1AA">{{ p.desc }}</p>
<!-- built with: the logos, named on hover -->
<div aria-label="{{ stackAria }}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 18px; margin-top: 22px; min-height: 24px">
<sc-for list="{{ logos }}" as="g" hint-placeholder-count="3"><span class="tip" data-tip="{{ g.t }}" style="display: flex; flex: none"><svg class="lg" width="{{ g.w2 }}" height="{{ g.h2 }}" viewBox="{{ g.vb }}" role="img" aria-label="{{ g.t }}" style="--b: {{ g.c }}"><path d="{{ g.d }}"></path></svg></span></sc-for>
<span style="font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #8A8A93">{{ stackText }}</span>
</div>
<!-- the details: an icon and the fact, nothing else to read; hover an icon for what it means -->
<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 30px; padding-top: 22px; border-top: 1px solid #1c1c22">
<sc-for list="{{ details }}" as="d" hint-placeholder-count="4">
<div style="display: flex; align-items: center; gap: 14px; font-size: 14.5px; line-height: 1.35; color: #D4D4D8">
<span class="tip" data-tip="{{ d.label }}" style="display: flex; flex: none; width: 18px; height: 18px; color: #8A8A93"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: {{ d.iconDisp }}"><path d="{{ d.icon }}"></path></svg><span style="display: {{ d.dotDisp }}; margin: 5px; width: 8px; height: 8px; border-radius: 99px; background: {{ d.dot }}; box-shadow: 0 0 0 3px {{ d.ring }}"></span></span>
<span><span class="sr">{{ d.label }}: </span>{{ d.v }}</span>
</div>
</sc-for>
</div>
<!-- where to go: the main link, and the source as a mark -->
<div style="display: flex; align-items: center; gap: 18px; margin-top: 26px; min-height: 22px">
<sc-for list="{{ links }}" as="l" hint-placeholder-count="1"><a class="ul" href="{{ l.href }}" style="font-size: 15px; color: #EDEDED">{{ l.label }} ↗</a></sc-for>
</div>
<div style="margin-top: auto; display: flex; justify-content: space-between; gap: 16px; font-size: 14px">
<button class="tb" type="button" onClick="{{ goPrev }}" style="font-size: 14px; text-align: left">← {{ pv.name }}</button>
<button class="tb" type="button" onClick="{{ goNext }}" style="font-size: 14px; text-align: right">{{ nx.name }} →</button>
</div>
</div>
<!-- right page: the work, and the story if there is one -->
<div class="ps" data-pscroll="{{ uid }}" onScroll="{{ onScroll }}" style="position: absolute; left: 520px; right: 0; top: 0; bottom: 0; overflow-y: auto">
<div style="padding: 108px 56px 120px 0; opacity: {{ cf.op }}; translate: 0 {{ cf.y }}">
''' + stage('heroL','520px','1') + '''
<sc-if value="{{ isNote }}" hint-placeholder-val="{{ false }}">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 16px">
<div style="height: 300px; border-radius: 12px; background: #131317; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c">[a detail]</div>
<div style="height: 300px; border-radius: 12px; background: #131317; display: flex; align-items: center; justify-content: center; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6b6f7c">[another detail]</div>
</div>
</sc-if>
<div style="padding-top: 48px">''' + POINTS + '''</div>
<div>''' + SEC2 + '''</div>
</div>
</div>
'''+RAIL
css_extra = '''.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.tip{position:relative}
.tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 10px);translate:-50% 4px;padding:5px 9px;border-radius:6px;background:#EDEDED;color:#0a0a0c;font:500 12px 'Geist',system-ui,sans-serif;letter-spacing:0;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s ease,translate .25s cubic-bezier(.22,1,.36,1);z-index:9}
.tip:hover::after{opacity:1;translate:-50% 0}
.toc{transition:color .3s ease}
.rail .railpanel{opacity:0;pointer-events:none;translate:12px -50%;transition:opacity .2s ease,translate .35s cubic-bezier(.22,1,.36,1)}
.rail .ticks{transition:opacity .2s ease}
.rail:hover .railpanel,.rail:focus-within .railpanel{opacity:1;pointer-events:auto;translate:0 -50%}
.rail:hover .ticks,.rail:focus-within .ticks{opacity:0}
.rl{display:block;width:100%;border:none;background:none;padding:9px 14px;border-radius:8px;font-family:inherit;font-size:14px;text-align:left;cursor:pointer;color:var(--c);white-space:nowrap;transition:background-color .15s ease,color .15s ease}
.rl:hover{background:#1a1a1f;color:#EDEDED}
</style>'''
js2 = js.replace('"default":"placard"','"default":"spread"')
js2 = js2.replace("const lay = this.props.layout === 'spread' ? 'b' : this.props.layout === 'sheet' ? 'c' : 'a';","const lay = 'b';")
js2 = js2.replace("    this.ICON = ","    this.FI = "+json.dumps(FI)+"; this.FICON = "+json.dumps(FICON)+";\n    this.ICON = ")
js2 = js2.replace("      sections: secs, hasToc: secs.length > 1,","""      sections: secs.map((s, i) => ({ ...s, isSystems: s.kind === 'systems', isStatus: s.kind === 'status', items: s.items || [], cols: s.cols || [], link: s.link || { label: '', href: '#' }, cur: i === this.cur ? 'true' : 'false', col: i === this.cur ? '#EDEDED' : '#8A8A93', tw: i === this.cur ? '26px' : '14px', tc: i === this.cur ? '#EDEDED' : '#3a3a42' })), hasToc: secs.length > 1,
      // details: the platform is the type's own icon; status is a dot; everything else an icon that names itself on hover
      details: (() => {
        const out = p.post ? [] : [{ label: 'Platform', v: (p.facts.find((f) => f.k === 'Platform') || {}).v || p.type, icon: this.ICON[this.TI[p.type]] }];
        p.facts.forEach((f) => {
          if (f.k === 'Platform') return;
          if (f.k === 'Status') { const s = (f.v || '').toLowerCase(); const live = /live|shipped|running/.test(s), wip = /pre-launch|prototype|beta|progress/.test(s); out.push({ label: 'Status', v: f.v, dot: live ? '#4ADE80' : wip ? '#F0B45A' : '#61616A', ring: live ? 'rgba(74,222,128,.18)' : wip ? 'rgba(240,180,90,.16)' : 'rgba(97,97,106,.2)', status: true }); return; }
          out.push({ label: f.k, v: f.v, icon: this.FICON[this.FI[f.k] || 'target'] });
        });
        return out.map((d) => ({ ...d, iconDisp: d.status ? 'none' : 'block', dotDisp: d.status ? 'block' : 'none', icon: d.icon || '', dot: d.dot || 'transparent', ring: d.ring || 'transparent' }));
      })(),
      onScroll: (e) => { const sc = e.currentTarget; let c = 0; secs.forEach((s, i) => { const el = document.getElementById(s.id); if (el && el.offsetTop - 260 <= sc.scrollTop) c = i; }); if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) c = secs.length - 1; this.cur = c; },""")
js2 = js2.replace("    this.setState({ pi: (this.state.pi + d + n) % n, swapAt: performance.now(), dir: d });","    this.cur = 0; this.setState({ pi: (this.state.pi + d + n) % n, swapAt: performance.now(), dir: d });")
js2 = js2.replace("logos: (p.stack || []).map((s) => this.LOGO[s]).filter(Boolean),","logos: (p.stack || []).map((s) => this.LOGO[s]).filter(Boolean).map((g) => ({ ...g, w2: (parseFloat(g.w) * 22 / 18).toFixed(1), h2: (parseFloat(g.h) * 22 / 18).toFixed(1) })),")
js2 = js2.replace("links: p.links || [],","links: (p.links || []).slice(0, 2),")
OPENREQ = open('/tmp/claude-0/-home-claude/b086297c-46b7-58c4-b54f-622f0b217526/scratchpad/gen/openreq.txt').read().rstrip('\n')
js2 = js2.replace('"default":"spread"},"project":','"default":"spread"},"bare":{"editor":"boolean","default":false},"openReq":{"editor":"text","default":""},"onBack":{"editor":null},"project":')
js2 = js2.replace("goBack: () => {},","goBack: () => { if (this.props.onBack) this.props.onBack(); },")
js2 = js2.replace("    const now = performance.now(), st = this.state, n = this.P.length;", OPENREQ)
js2 = js2.replace("uid: this.uid, navVis: 'visible',","uid: this.uid, navVis: 'visible', navVis2: this.props.bare ? 'hidden' : 'visible', pageBg: this.props.bare ? 'transparent' : '#0a0a0c',")
js2 = js2.replace("uid: this.uid, p, nx:", "uid: this.uid, backText: p.post ? '\\u2190 Back to the index' : '\\u2190 Back to the wall', navVis: 'visible', navVis2: this.props.bare ? 'hidden' : 'visible', pageBg: this.props.bare ? 'transparent' : '#0a0a0c', p, nx:")
assert 'backText:' in js2
assert 'details:' in js2 and 'onScroll:' in js2 and "const lay = 'b';" in js2
out2 = head.replace('overflow: hidden; background: #0a0a0c; color: #EDEDED;','overflow: hidden; background: {{ pageBg }}; color: #EDEDED;').replace('</style>', css_extra).replace('<title>Project page — three structures</title>','<title>Project page — spread</title>') + nav.replace('z-index: 5','z-index: 5; visibility: {{ navVis2 }}') + S2 + js2
open(SP+'wall/project/ProjectSpread.dc.html','w').write(out2)
print(len(out2))
