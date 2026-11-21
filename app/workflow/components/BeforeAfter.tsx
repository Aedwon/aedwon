"use client";

import { useEffect, useRef, useState } from "react";
import { Reply } from "./Reply";

type Item = { type: "quote" | "reply"; text: string };

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_EXIT = "cubic-bezier(0.32, 0, 0.85, 0.9)";

function isReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelAnims(el: HTMLElement | null) {
  if (!el || typeof el.getAnimations !== "function") return;
  el.getAnimations().forEach((a) => a.cancel());
}

/** Interruptible Before/After toggle with a gliding indicator and smooth height transition. */
export function BeforeAfter({ items }: { items: Item[] }) {
  const sides: { quotes: string[]; reply: string }[] = [];
  let quotes: string[] = [];
  for (const item of items) {
    if (item.type === "quote") quotes.push(item.text);
    else {
      sides.push({ quotes, reply: item.text });
      quotes = [];
    }
  }
  const before = sides[0] ?? { quotes: [], reply: "" };
  const after = sides[1] ?? { quotes: [], reply: "" };

  const [state, setState] = useState<"before" | "after">("before");
  const segRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const beforeBtnRef = useRef<HTMLButtonElement>(null);
  const afterBtnRef = useRef<HTMLButtonElement>(null);
  const askWrapRef = useRef<HTMLDivElement>(null);
  const askBeforeRef = useRef<HTMLDivElement>(null);
  const askAfterRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const replyBeforeRef = useRef<HTMLDivElement>(null);
  const replyAfterRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const knobTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<"before" | "after">("before");

  function syncKnob(target: "before" | "after", animate: boolean) {
    const seg = segRef.current;
    const knob = knobRef.current;
    const btn = target === "before" ? beforeBtnRef.current : afterBtnRef.current;
    if (!seg || !knob || !btn) return;
    if (!animate || isReducedMotion()) {
      knob.style.transition = "none";
      knob.style.width = `${btn.offsetWidth}px`;
      knob.style.transform = `translate3d(${btn.offsetLeft - 2}px, 0, 0)`;
      seg.classList.remove("gliding");
      return;
    }
    seg.classList.add("gliding");
    void knob.getBoundingClientRect();
    knob.style.transition = "";
    knob.style.width = `${btn.offsetWidth}px`;
    knob.style.transform = `translate3d(${btn.offsetLeft - 2}px, 0, 0)`;
    if (knobTimerRef.current) clearTimeout(knobTimerRef.current);
    knobTimerRef.current = setTimeout(() => {
      seg.classList.remove("gliding");
    }, 460);
  }

  useEffect(() => {
    syncKnob(stateRef.current, false);
    const onResize = () => syncKnob(stateRef.current, false);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (knobTimerRef.current) clearTimeout(knobTimerRef.current);
    };
  }, []);

  async function switchTo(next: "before" | "after") {
    if (next === stateRef.current) return;
    const id = ++runRef.current;
    syncKnob(stateRef.current, false);
    stateRef.current = next;
    setState(next);
    syncKnob(next, true);

    const replyEl = replyRef.current;
    const askWrapEl = askWrapRef.current;
    const outR = next === "after" ? replyBeforeRef.current : replyAfterRef.current;
    const inR = next === "after" ? replyAfterRef.current : replyBeforeRef.current;
    const outA = next === "after" ? askBeforeRef.current : askAfterRef.current;
    const inA = next === "after" ? askAfterRef.current : askBeforeRef.current;
    if (!replyEl || !askWrapEl || !outR || !inR || !outA || !inA) return;

    [replyEl, askWrapEl, outR, inR, outA, inA].forEach(cancelAnims);
    const h0 = replyEl.offsetHeight;
    const a0 = askWrapEl.offsetHeight;
    const canAnimate = !isReducedMotion() && typeof outR.animate === "function";

    if (canAnimate) {
      const fo = outR.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE_EXIT, fill: "forwards" });
      outA.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE_EXIT, fill: "forwards" });
      await fo.finished.catch(() => {});
      if (id !== runRef.current) return;
    }

    outR.hidden = true;
    outA.hidden = true;
    cancelAnims(outR);
    cancelAnims(outA);
    inR.hidden = false;
    inA.hidden = false;

    if (canAnimate) {
      const h1 = replyEl.offsetHeight;
      const a1 = askWrapEl.offsetHeight;
      replyEl.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 440, easing: EASE });
      askWrapEl.animate([{ height: `${a0}px` }, { height: `${a1}px` }], { duration: 440, easing: EASE });
      inA.animate(
        [
          { opacity: 0, transform: "translate3d(6px, 0, 0)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 340, delay: 40, easing: EASE, fill: "backwards" },
      );
      inR.animate(
        [
          { opacity: 0, transform: "translate3d(0, 4px, 0)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 340, delay: 40, easing: EASE, fill: "backwards" },
      );
    }
  }

  return (
    <>
      <div className="seg" ref={segRef} role="group" aria-label="Reply">
        <span className="knob" ref={knobRef} aria-hidden="true" />
        <button type="button" ref={beforeBtnRef} aria-pressed={state === "before"} onClick={() => switchTo("before")}>
          Before
        </button>
        <button type="button" ref={afterBtnRef} aria-pressed={state === "after"} onClick={() => switchTo("after")}>
          After
        </button>
      </div>
      <div className="thread">
        <div className="askwrap" ref={askWrapRef}>
          <div className="ask" ref={askBeforeRef}>
            {before.quotes.map((q) => (
              <div className="msg" key={q}>
                {q}
              </div>
            ))}
          </div>
          <div className="ask" ref={askAfterRef} hidden>
            {after.quotes.map((q) => (
              <div className="msg" key={q}>
                {q}
              </div>
            ))}
          </div>
        </div>
        <div className="reply" ref={replyRef} aria-live="polite">
          <div className="reply-in" ref={replyBeforeRef} role="region" aria-label="Before reply">
            <Reply source={before.reply} />
          </div>
          <div className="reply-in" ref={replyAfterRef} role="region" aria-label="After reply" hidden>
            <Reply source={after.reply} />
          </div>
        </div>
      </div>
    </>
  );
}
