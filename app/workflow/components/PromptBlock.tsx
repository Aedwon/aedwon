import { CopyButton } from "./CopyButton";

/** Full copyable prompt block with its Copy button in the top-right corner. */
export function PromptBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="prompt" data-title={title}>
      <pre>
        <code>{text}</code>
      </pre>
      <CopyButton text={text} ariaLabel={`Copy the ${title} prompt`} />
    </div>
  );
}
