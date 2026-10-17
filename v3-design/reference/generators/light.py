# Light theme, made by role rather than by inverting: the room and UI get light tokens,
# each kind of media keeps what it would really look like (dark phone bezels, a dark terminal,
# light Discord), books keep their own colours, paper stays paper.
import re
SP='/tmp/claude-0/-home-claude/b086297c-46b7-58c4-b54f-622f0b217526/scratchpad/final/project/'
SH='0 1px 2px rgba(17,17,20,.05), 0 16px 36px -18px rgba(17,17,20,.28)'
UI={
'#0a0a0c':'#F2F1ED','#ededed':'#111114','#d4d4d8':'#2E2E34','#c4c4cc':'#3A3A40','#a1a1aa':'#56565E','#8a8a93':'#6A6A72',
'#7a7a83':'#76767E','#71717a':'#7E7E86','#6b6f7c':'#8A8A92','#61616a':'#8E8E95','#5a5a63':'#A3A29C','#4a4a52':'#B3B1AB',
'#3f3f46':'#BFBDB7','#3a3a42':'#C4C2BC','#34343b':'#CFCDC6','#2e2e35':'#D3D1CA','#2c2c32':'#DCDAD4','#2c2c34':'#DCDAD4',
'#2c2c33':'#DCDAD4','#2a2a30':'#D6D4CD','#2a2a31':'#D6D4CD','#26262c':'#DCDAD3','#25252b':'#DEDCD6','#222228':'#E2E0DA',
'#202026':'#E4E2DC','#1f1f25':'#E3E1DB','#1f1f24':'#E3E1DB','#1e1e24':'#E5E3DD','#1c1c22':'#E6E4DE','#1c1c21':'#E6E4DE',
'#1a1a1f':'#E9E7E2','#18181d':'#EBE9E4','#18181c':'#ECEAE5','#17171b':'#EEEDE8','#15151a':'#F0EFEA','#141418':'#EFEEE9',
'#131317':'#FFFFFF','#121215':'#FAFAF8','#101013':'#FAFAF8','#0f0f12':'#FFFFFF','#0e0e11':'#E8E6E0','#0d0d10':'#F7F6F3',
'#08080a':'#FFFFFF','#4ade80':'#16A34A','#f0b45a':'#B7791F','#ffffff':'#2A2A30',
}
# per kind of media: what that thing really looks like in a light room
MEDIA={
'phone app':{'#050506':'#1B1B1F','#2e2e35':'#1B1B1F','#131317':'#FFFFFF','#8A8A93':'#8E8E95'},
'Android TV':{'#050506':'#1B1B1F','#2e2e35':'#1B1B1F','#131317':'#FFFFFF','#8A8A93':'#8E8E95','#141418':'#2A2A2F','#1c1c21':'#3A3A40'},
'website':{'#26262c':'#E3E1DB','#0f0f12':'#FFFFFF','#2c2c32':'#E2E0DA','#1c1c22':'#EEECE7','#131317':'#FAFAF8','#8A8A93':'#8E8E95'},
'Discord':{'#26262c':'#E3E1DB','#0d0d10':'#E3E5E8','#2c2c34':'#C4C8CE','#1e1e24':'#D3D6DB','#121215':'#F2F3F5','#1f1f25':'#DEE1E5','#17171b':'#FFFFFF','#8A8A93':'#80848E'},
'developer tool':{'#26262c':'#1E1E22'},
'open source':{'#26262c':'#E3E1DB','#0f0f12':'#FFFFFF','#EDEDED':'#111114','#8A8A93':'#6A6A72','#A1A1AA':'#56565E','#1c1c22':'#ECEAE5'},
'data system':{'#26262c':'#E3E1DB','#131317':'#FFFFFF','#8A8A93':'#8E8E95'},
'writing':{'#ECEBE6':'#FFFFFF','border-radius: 3px; background: #FFFFFF':'border-radius: 3px; background: #FFFFFF; border: 1px solid #E6E4DE'},
}
HEX=re.compile(r'#[0-9a-fA-F]{6}\b')
def ui_map(s):
    # colours built in script strings (the points on the canvas)
    s=s.replace("'rgba(237,237,237,'","'rgba(17,17,20,'").replace('let a = (0.075 + 0.33 * e)','let a = (0.11 + 0.30 * e)')
    s=HEX.sub(lambda m: UI.get(m.group(0).lower(), m.group(0)), s)
    def rg(m):
        r,g,b,a=[x.strip() for x in m.group(1).split(',')]
        key=(r,g,b)
        if key==('237','237','237'): return f'rgba(17,17,20,{a}'
        if key==('10','10','12'): return f'rgba(242,241,237,{a}'
        if key==('17','17','20'): return f'rgba(255,255,255,{a}'
        if key==('0','0','0'):
            try: return f'rgba(17,17,20,{float(a)*0.35:.3f}'
            except ValueError: return m.group(0)
        return m.group(0)
    s=re.sub(r'rgba\(([^()]*?,[^()]*?,[^()]*?,[^()]*?)(?=\))', rg, s)
    return s
def media_map(kind, s):
    for a,b in MEDIA[kind].items(): s=s.replace(a,b)
    # lift each object off the wall with a soft shadow (box-shadow, so 3D stays intact)
    if kind in ('phone app',):
        s=s.replace('border-radius: 28px; background: #1B1B1F;','border-radius: 28px; background: #1B1B1F; box-shadow: '+SH+';')
    elif kind=='Android TV':
        s=s.replace('border-radius: 10px; background: #1B1B1F;','border-radius: 10px; background: #1B1B1F; box-shadow: '+SH+';',1)
    else:
        i=s.index('<div style="',s.index('-->'))+len('<div style="'); s=s[:i]+'box-shadow: '+SH+'; '+s[i:]
    return s
def convert(src, protect=()):
    # split into media blocks (own map), protected spans (untouched) and the rest (UI map)
    spans=[]
    for kind in MEDIA:
        for m in re.finditer(r'<!-- (?:'+re.escape(kind)+r')[^>]*-->', src):
            e=src.index('</sc-if>', m.end()); spans.append((m.start(), e, kind))
    for pat in protect:
        for m in re.finditer(pat, src, re.S): spans.append((m.start(), m.end(), None))
    spans.sort(); out=[]; pos=0
    for a,b,k in spans:
        if a<pos: continue
        out.append(ui_map(src[pos:a])); seg=src[a:b]
        out.append(media_map(k,seg) if k else seg); pos=b
    out.append(ui_map(src[pos:]))
    return ''.join(out)

# WallIndex2 + ProjectSpread
for name in ['WallIndex2','ProjectSpread']:
    s=open(SP+name+'.dc.html').read()
    s=convert(s)
    s=s.replace('<title>','<title>(light) ',1)
    open(SP+name+'Light.dc.html','w').write(s)

# AboutVolumes: the volumes keep their colours; the shelf becomes pale wood-grey; page edges stay paper
s=open(SP+'AboutVolumes.dc.html').read()
shelf_old=s[s.index('<div style="position: absolute; left: 300px; width: 840px; top: 780px'):s.index('<div style="position: absolute; left: 1004px; top: 766px')]
shelf_old=s[s.index('<div style="position: absolute; left: 300px; width: 840px; top: 780px'):s.index('\n',s.index('<div style="position: absolute; left: 1004px; top: 766px'))]
shelf_new=('<div style="position: absolute; left: 300px; width: 840px; top: 780px; height: 2px; background: #FFFFFF"></div>\n'
'<div style="position: absolute; left: 300px; width: 840px; top: 782px; height: 16px; background: #E1DFD8; box-shadow: 0 10px 22px -10px rgba(17,17,20,.25)"></div>\n'
'<div style="position: absolute; left: 310px; width: 820px; top: 798px; height: 26px; background: linear-gradient(rgba(17,17,20,.07), rgba(17,17,20,0))"></div>\n'
'<div style="position: absolute; left: 340px; top: 744px; width: 150px; height: 36px; border-radius: 3px; background: #DAD8D1; border-top: 1px solid #E8E6E0"></div>\n'
'<div style="position: absolute; left: 350px; top: 712px; width: 134px; height: 32px; border-radius: 3px; background: #26262B; border-top: 1px solid #3a3a40"></div>\n'
'<div style="position: absolute; left: 346px; top: 686px; width: 142px; height: 26px; border-radius: 3px; background: #FBFAF7; border-top: 1px solid #FFFFFF; box-shadow: inset 0 -1px 0 #E3E1DB"></div>\n'
'<div style="position: absolute; left: 1004px; top: 600px; width: 14px; height: 180px; background: #2A2A30; border-left: 1px solid #3a3a42"></div>\n'
'<div style="position: absolute; left: 1004px; top: 766px; width: 64px; height: 14px; background: #2A2A30"></div>')
s=s.replace(shelf_old,'@@SHELF@@')
s=convert(s, protect=[r"\.edge\{.*?\}\n\.edgeV\{.*?\}", r"const L = '#EDEDED', D = '#0a0a0c';.*?\n    \];", r"[^\n]*v\.ink === [^\n]*", r"[^\n]*rd\.castW[^\n]*"])
s=s.replace("v.ink === '#0a0a0c' ? 0.5 :","v.ink === '#0a0a0c' ? 0.26 :")  # light volumes in a light room need less shade
s=s.replace('@@SHELF@@',shelf_new).replace('<title>','<title>(light) ',1)
open(SP+'AboutVolumesLight.dc.html','w').write(s)

# Room
s=open(SP+'Room.dc.html').read()
s=convert(s)
for a in ['WallIndex2','AboutVolumes','ProjectSpread']:
    s=s.replace(f'<dc-import name="{a}" ',f'<dc-import name="{a}Light" ')
s=s.replace('<title>','<title>(light) ',1)
open(SP+'RoomLight.dc.html','w').write(s)
print('ok')
