"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculateWishStats,
  type GenshinBannerType,
  type GenshinWishRecord,
} from "@/lib/genshin-wish-stats";

const BANNERS: { id: GenshinBannerType; label: string; hardPity: number }[] = [
  { id: "character", label: "Character", hardPity: 90 },
  { id: "weapon", label: "Weapon", hardPity: 80 },
  { id: "standard", label: "Standard", hardPity: 90 },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatAverage(value: number | null) {
  if (value === null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function GenshinWishCounterPage({
  wishes,
}: {
  wishes: GenshinWishRecord[];
}) {
  const [bannerType, setBannerType] = useState<GenshinBannerType>("character");
  const stats = useMemo(
    () => calculateWishStats(wishes, bannerType),
    [wishes, bannerType],
  );
  const banner = BANNERS.find((item) => item.id === bannerType) ?? BANNERS[0];

  return (
    <div className="space-y-8 pb-4">
      <header className="space-y-5">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          ← Back to all projects
        </Link>

        <div className="max-w-[720px] space-y-2">
          <h1 className="text-[28px] font-bold leading-[1.25] tracking-[-0.025em] text-[var(--text-primary)] sm:text-[32px] font-[var(--font-heading)]">
            Genshin Wish Counter
          </h1>
          <p className="text-[15px] leading-[1.7] text-[var(--text-muted)]">
            My saved wish history, with current pity and five-star pull statistics.
          </p>
        </div>
      </header>

      <div
        role="group"
        aria-label="Wish banner"
        className="inline-flex max-w-full overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 shadow-[var(--card-shadow)]"
      >
        {BANNERS.map((item) => {
          const selected = item.id === bannerType;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setBannerType(item.id)}
              className={`min-w-[92px] rounded-[7px] px-4 py-2 text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] ${
                selected
                  ? "bg-[var(--text-primary)] text-[var(--bg-canvas)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {!stats ? (
        <section className="relative overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-14 shadow-[var(--card-shadow)] sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_82%_28%,color-mix(in_srgb,var(--accent)_18%,transparent)_0,transparent_28%),radial-gradient(circle_at_72%_58%,color-mix(in_srgb,var(--text-primary)_8%,transparent)_0_1px,transparent_1.5px)] [background-size:auto,28px_28px]"
          />
          <div className="relative max-w-[520px] space-y-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] text-[var(--text-muted)]">
              <Sparkles aria-hidden="true" size={17} strokeWidth={1.8} />
            </span>
            <div className="space-y-2">
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
                Wish history not synced yet
              </h2>
              <p className="text-[14px] leading-[1.7] text-[var(--text-muted)]">
                This page is ready for my saved pull history. The statistics will appear here after the next history refresh.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--card-shadow)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] opacity-70 sm:block [background-image:radial-gradient(circle_at_65%_45%,color-mix(in_srgb,var(--accent)_17%,transparent)_0,transparent_38%),radial-gradient(circle,color-mix(in_srgb,var(--text-primary)_16%,transparent)_0_1px,transparent_1.5px)] [background-size:auto,26px_26px] [mask-image:linear-gradient(to_left,black,transparent)]"
            />

            <div className="relative grid gap-8 px-6 py-7 sm:grid-cols-[1.35fr_1fr] sm:px-8 sm:py-8">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--text-dim)]">
                  Current pity
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-[var(--text-primary)] sm:text-[56px]">
                    {stats.currentFiveStarPity}
                  </span>
                  <span className="text-[20px] font-medium text-[var(--text-dim)]">
                    / {banner.hardPity}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-[var(--text-muted)]">
                  {Math.max(0, banner.hardPity - stats.currentFiveStarPity)} pulls until hard pity
                </p>

                {bannerType === "character" && stats.guaranteedNextFiveStar ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-primary)]">
                    <ShieldCheck aria-hidden="true" size={13} />
                    Guaranteed
                  </div>
                ) : null}
              </div>

              <dl className="grid content-end gap-4 border-t border-[var(--border-subtle)] pt-5 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-[0.1em] text-[var(--text-dim)]">
                    Last 5★
                  </dt>
                  <dd className="mt-1 text-[15px] font-medium text-[var(--text-primary)]">
                    {stats.lastFiveStar?.name ?? "No five-star yet"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-[0.1em] text-[var(--text-dim)]">
                    4★ pity
                  </dt>
                  <dd className="mt-1 text-[15px] font-medium text-[var(--text-primary)]">
                    {stats.currentFourStarPity} / 10
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Total wishes" value={stats.totalWishes.toLocaleString("en-US")} />
            <Metric label="Five-stars" value={stats.fiveStarCount.toLocaleString("en-US")} />
            <Metric label="Average 5★ pity" value={formatAverage(stats.averageFiveStarPity)} />
          </dl>

          <section className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--card-shadow)]">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
              <Star aria-hidden="true" size={15} strokeWidth={1.8} className="text-[var(--text-dim)]" />
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
                5★ history
              </h2>
            </div>

            {stats.fiveStarHistory.length === 0 ? (
              <p className="px-5 py-8 text-[13px] text-[var(--text-muted)] sm:px-6">
                No five-star pulls in this banner history yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] border-collapse text-left">
                  <thead>
                    <tr className="text-[10.5px] font-mono uppercase tracking-[0.1em] text-[var(--text-dim)]">
                      <th className="px-5 py-3 font-normal sm:px-6">Pull</th>
                      <th className="px-4 py-3 font-normal">Pity</th>
                      <th className="px-5 py-3 text-right font-normal sm:px-6">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.fiveStarHistory.map((wish) => (
                      <tr key={wish.id} className="border-t border-[var(--border-subtle)] text-[13px]">
                        <td className="px-5 py-3.5 font-medium text-[var(--text-primary)] sm:px-6">
                          {wish.name}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[var(--text-muted)]">
                          {wish.pity ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[var(--text-muted)] sm:px-6">
                          {formatDate(wish.time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4 shadow-[var(--card-shadow)]">
      <dt className="text-[11px] font-mono uppercase tracking-[0.09em] text-[var(--text-dim)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}
