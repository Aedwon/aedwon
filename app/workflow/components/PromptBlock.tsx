"use client";

import { useId, useState } from "react";
import { CopyButton } from "./CopyButton";

export const PROMPT_PREVIEW_LINES = 8;

/**
 * A prompt longer than eight lines shows its first eight and a button to show the rest in place.
 * Copy is always in the header and always copies the whole prompt.
 */
export function PromptBlock({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const lines = text.split("\n");
  const long = lines.length > PROMPT_PREVIEW_LINES;
  const shown = long && !open ? lines.slice(0, PROMPT_PREVIEW_LINES).join("\n") : text;
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span className="ttl">Prompt</span>
        <CopyButton text={text} />
      </div>
      <pre id={`${id}-text`}>
        <code>{shown}</code>
      </pre>
      {long ? (
        <div className="prompt-foot">
          <button type="button" className="link-btn" aria-expanded={open} aria-controls={`${id}-text`} onClick={() => setOpen((v) => !v)}>
            {open ? "Show less" : "Show full prompt"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
