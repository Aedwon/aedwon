"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/workflow/clipboard";

interface Props {
  text: string;
  label?: string;
  doneLabel?: string;
  className?: string;
}

/** A button that copies `text` and says "Copied" for a moment. */
export function CopyButton({ text, label = "Copy", doneLabel = "Copied", className = "btn btn-secondary btn-sm" }: Props) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function onClick() {
    const ok = await copyText(text);
    if (!ok) return;
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  }

  return (
    <>
      <button type="button" className={className} onClick={onClick}>
        {done ? doneLabel : label}
      </button>
      <span className="sr" role="status">
        {done ? doneLabel : ""}
      </span>
    </>
  );
}
