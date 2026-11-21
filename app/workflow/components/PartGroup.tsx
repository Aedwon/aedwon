"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { WorkflowPart } from "@/lib/workflow/types";
import { CopyButton } from "./CopyButton";

interface GroupCtx {
  groupId: string;
  openId: string | null;
  toggle: (id: string) => void;
}

const Ctx = createContext<GroupCtx | null>(null);

export function usePartGroup(): GroupCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("PartNode must sit inside a PartGroup");
  return v;
}

function buttonId(groupId: string, partId: string) {
  return `${groupId}-${partId}`;
}

export function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 6l4.5 4.5L12.5 6" />
    </svg>
  );
}

/** The one disclosure pattern: a part is a button, and its detail opens in the panel under its picture. */
export function PartNode({ part, sub, outside }: { part: WorkflowPart; sub?: string; outside?: boolean }) {
  const { groupId, openId, toggle } = usePartGroup();
  const open = openId === part.id;
  return (
    <h2 className="part-h">
      <button
        type="button"
        id={buttonId(groupId, part.id)}
        className={`part${outside ? " outside" : ""}`}
        aria-expanded={open}
        aria-controls={`${groupId}-panel`}
        onClick={() => toggle(part.id)}
      >
        <span className="nm">{part.title}</span>
        <Chevron />
        {sub ? <span className="sb">{sub}</span> : null}
      </button>
    </h2>
  );
}

function PartDetail({ part }: { part: WorkflowPart }) {
  return (
    <>
      {part.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {part.lines ? (
        <ul className="model-list">
          {part.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
      {part.prompt ? <PromptBlock text={part.prompt} /> : null}
    </>
  );
}

export function PromptBlock({ text }: { text: string }) {
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span className="ttl">Prompt</span>
        <CopyButton text={text} />
      </div>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}

interface GroupProps {
  label: string;
  parts: WorkflowPart[];
  children: ReactNode;
}

/** A picture and its parts. One part is open at a time, and its detail shows in one panel below. */
export function PartGroup({ label, parts, children }: GroupProps) {
  const groupId = useId().replace(/:/g, "");
  const [openId, setOpenId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
    setShownId(id);
  }, []);

  useEffect(() => {
    if (!openId || !panel.current || typeof panel.current.scrollIntoView !== "function") return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    panel.current.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [openId]);

  const shown = parts.find((p) => p.id === shownId) ?? null;

  return (
    <Ctx.Provider value={{ groupId, openId, toggle }}>
      <section aria-label={label}>
        {children}
        <div ref={panel} id={`${groupId}-panel`} className="detail" data-open={openId !== null}>
          <div>
            <div className="detail-in" role="region" aria-labelledby={shown ? buttonId(groupId, shown.id) : undefined}>
              {shown ? <PartDetail key={shown.id} part={shown} /> : null}
            </div>
          </div>
        </div>
      </section>
    </Ctx.Provider>
  );
}
