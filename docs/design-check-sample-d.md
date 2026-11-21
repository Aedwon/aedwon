# Design check on sample D

This is the output of `node scripts/design-check/cli.mjs sample-d/index.html` on the rejected workflow map sample (sample D), and it exits 1.

```
Design check: sample-d/index.html
Viewports 1440x900 and 390x844. 12 error rules, 4 warning rules.

ERROR contrast (1)
  Text below WCAG 2.0 AA contrast (4.5 to 1, or 3 to 1 for large text).
  - p "Snapshot of November 21, 202" 3.45:1, needs 4.5:1

ERROR budget-radii (7)
  7 distinct corner radii, not counting fully round shapes, and 3 pairs only 1px apart. Budget is 5 (warn), 8 or 2 near pairs (error).
  - 12, 13, 14, 17, 21, 22, 24 px

ERROR budget-shadows (13)
  13 distinct shadow definitions, counting stylesheet states. Budget is 3 (warn) and 5 (error).
  - rgba(255, 170, 60, 0.22) 0px 12px 44px 0px
  - rgb(21, 18, 15) 0px 0px 0px 0px, rgba(255, 255, 255, 0) 0px 0px 0px 0p...
  - rgba(255, 179, 71, 0.15) 0px 0px 0px 1px, rgba(255, 170, 60, 0.14) 0px...

ERROR accent-hues (3)
  3 chromatic hue families outside status colors. His projects use one accent, or none.
  - hue 35deg to 35deg, 13 elements, e.g. rgb(255,179,71)
  - hue 162deg to 162deg, 20 elements, e.g. rgb(94,240,196)
  - hue 256deg to 256deg, 4 elements, e.g. rgb(183,156,255)

ERROR glow (17)
  Colored glow, or a large blur on a resting element. His shadows are neutral and only on things that float.
  - div.node.k-aedwon shadow 44px blur, rgb(255,170,60) (at rest)
  - button.node.k-lead shadow 0px blur, rgb(255,179,71) (at rest)
  - button.node.k-lead shadow 50px blur, rgb(255,170,60) (at rest)

ERROR gradient-surface (2)
  Gradient used as a surface or wash. His projects use flat fills.
  - ::before radial-gradient(900px 520px at 50% 40%, 
  - div.node.k-aedwon linear-gradient(160deg, rgb(255, 193, 94

ERROR border-thick (6)
  Border thicker than 1px on a resting element. His projects reserve 2px for focus and selection.
  - button.node.k-gate 2px
  - button.node.k-gate 2px
  - button.node.k-gate 2px

ERROR border-dashed (2)
  Dashed or dotted border. His interface borders are solid.
  - div.frame
  - button.node.k-gate

ERROR pill-shape (9)
  Pill-shaped button or label (radius of half the height or more).
  - button.pill "Where to paste" 170x44, radius 22
  - button.pill "Before and after" 178x44, radius 22
  - button.pill.fill "Copy for my agent" 196x44, radius 22

ERROR duration-band (68)
  Motion outside 70 to 500 ms (error above 700 ms). His UI motion is 120 to 300 ms.
  - path.mk transition stroke-dashoffset 900ms
  - div.head transition opacity 800ms
  - div.head transition transform 800ms

ERROR entrance-length (1)
  Page motion kept running for 5691 ms after load (measured up to 6000 ms). Warn above 600 ms, error above 1500 ms.
  - 5691 ms

ERROR hover-scale (2)
  Hover, focus or selected state that scales parts above 1.02 or moves them more than 2px.
  - .node.on (scale 1.045)
  - .round.play:hover (scale 1.06)

WARN budget-font-sizes (8)
  8 distinct font sizes, 3 pairs within 0.5px of each other. Budget is 8 sizes (warn) and 10 (error).
  - 15.5, 17, 17.5, 18, 18.5, 20, 25, 30 px

WARN budget-border-styles (2)
  More than one border style on the page. His projects use solid only.
  - solid, dashed

WARN mono-outside-code (14)
  Monospace text outside code or prompt blocks.
  - p "Snapshot of November 21, 202" Spline Sans Mono
  - div.s "Executive" Spline Sans Mono
  - div.s "Global rules" Spline Sans Mono

WARN target-size-touch (2)
  Interactive target under 44 by 44 px on the phone layout (suggested floor).
  - button.mode "One task" 177x40
  - button.mode "How the rules grew" 177x40

Result: FAIL
```
