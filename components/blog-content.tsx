import React from 'react';
import type { BlogBlock } from '@/lib/data/blogs';

const inlinePattern = /(\*[^*]+\*|\[\d+\])/g;

function renderInline(text: string) {
  return text.split(inlinePattern).filter(Boolean).map((part, index) => {
    const emphasis = part.match(/^\*([^*]+)\*$/);
    if (emphasis) {
      return <em key={`${part}-${index}`}>{emphasis[1]}</em>;
    }

    const source = part.match(/^\[(\d+)\]$/);
    if (source) {
      const number = source[1];
      return (
        <sup key={`${part}-${index}`} className="ml-0.5 align-super text-[0.72em]">
          <a
            href={`#source-${number}`}
            className="font-mono text-[var(--accent)] no-underline hover:underline"
            aria-label={`Jump to source ${number}`}
          >
            [{number}]
          </a>
        </sup>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="text-[15.5px] leading-[1.82] text-[var(--text-muted)]">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === 'heading') {
          return (
            <h2
              key={index}
              id={block.id}
              className="scroll-mt-24 pt-8 text-[20px] sm:text-[22px] font-semibold tracking-[-0.015em] leading-[1.35] text-[var(--text-primary)] font-[var(--font-heading)]"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === 'pullquote') {
          return (
            <blockquote
              key={index}
              className="my-9 border-y border-[var(--border-subtle)] py-6 sm:py-7"
            >
              <p className="whitespace-pre-line text-[18px] sm:text-[20px] leading-[1.6] tracking-[-0.01em] text-[var(--text-primary)] font-[var(--font-heading)]">
                {renderInline(block.text)}
              </p>
            </blockquote>
          );
        }

        return (
          <section key={index} aria-labelledby="sources-and-further-reading" className="pt-9">
            <h2
              id="sources-and-further-reading"
              className="mb-5 text-[20px] sm:text-[22px] font-semibold tracking-[-0.015em] leading-[1.35] text-[var(--text-primary)] font-[var(--font-heading)]"
            >
              Sources and further reading
            </h2>
            <ol className="space-y-4 text-[13.5px] leading-[1.7] text-[var(--text-muted)]">
              {block.items.map((source) => (
                <li key={source.number} id={`source-${source.number}`} className="scroll-mt-24 flex gap-3">
                  <span className="w-6 shrink-0 font-mono text-[12px] text-[var(--text-dim)]">
                    [{source.number}]
                  </span>
                  <p>
                    {source.author}.{' '}
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--text-primary)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--accent)]"
                    >
                      {source.title}
                    </a>
                    {source.publication ? <>{'. '}<em>{source.publication}</em></> : null}
                    {source.details ? <>. {source.details}</> : null}
                    .
                  </p>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
