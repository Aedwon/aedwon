"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  calculateWishStats,
  type GenshinBannerType,
  type GenshinWishRecord,
} from "@/lib/genshin-wish-stats";
import styles from "./GenshinWishCounterPage.module.css";

const BANNERS: { id: GenshinBannerType; label: string; hardPity: number }[] = [
  { id: "character", label: "Character", hardPity: 90 },
  { id: "weapon", label: "Weapon", hardPity: 80 },
  { id: "standard", label: "Standard", hardPity: 90 },
];

const PAIMON_CHARACTER_ASSET_BASE =
  "https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/static/images/characters";

const CHARACTER_PORTRAITS: Record<string, string> = {
  Citlali: "citlali.png",
  Columbina: "columbina.png",
  Dehya: "dehya.png",
  Diluc: "diluc.png",
  Durin: "durin.png",
  Escoffier: "escoffier.png",
  Ineffa: "ineffa.png",
  Keqing: "keqing.png",
  Odette: "odette.png",
  Sandrone: "sandrone.png",
  Tighnari: "tighnari.png",
};

type PityScaleStyle = CSSProperties & {
  "--pity-bg-light": string;
  "--pity-fg-light": string;
  "--pity-border-light": string;
  "--pity-bg-dark": string;
  "--pity-fg-dark": string;
  "--pity-border-dark": string;
};

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

function characterPortraitUrl(name: string) {
  const filename = CHARACTER_PORTRAITS[name];
  return filename ? `${PAIMON_CHARACTER_ASSET_BASE}/${filename}` : null;
}

function getPityScaleStyle(pity: number, hardPity: number): PityScaleStyle {
  const clamped = Math.max(1, Math.min(hardPity, pity));
  const progress = (clamped - 1) / Math.max(1, hardPity - 1);
  const hue = Math.round(128 * (1 - progress));
  const lightBackground = Math.round(96 - 56 * progress);
  const lightForeground = progress < 0.62 ? 24 : 96;
  const lightBorder = Math.round(80 - 43 * progress);
  const darkBackground = Math.round(14 + 6 * progress);
  const darkForeground = Math.round(82 - 10 * progress);
  const darkBorder = Math.round(36 + 8 * progress);

  return {
    display: "inline-flex",
    backgroundColor: "var(--pity-bg)",
    color: "var(--pity-fg)",
    borderColor: "var(--pity-border)",
    "--pity-bg-light": `hsl(${hue} 62% ${lightBackground}%)`,
    "--pity-fg-light": `hsl(${hue} 66% ${lightForeground}%)`,
    "--pity-border-light": `hsl(${hue} 45% ${lightBorder}%)`,
    "--pity-bg-dark": `hsl(${hue} 54% ${darkBackground}%)`,
    "--pity-fg-dark": `hsl(${hue} 72% ${darkForeground}%)`,
    "--pity-border-dark": `hsl(${hue} 48% ${darkBorder}%)`,
  };
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

          <section className="space-y-3" aria-labelledby="five-star-history-heading">
            <div className="flex items-center gap-2 px-1">
              <Star aria-hidden="true" size={15} strokeWidth={1.8} className="text-[var(--text-dim)]" />
              <h2
                id="five-star-history-heading"
                className="text-[15px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"
              >
                5★ history
              </h2>
            </div>

            <div
              role="group"
              aria-labelledby="five-star-history-heading"
              className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--card-shadow)]"
            >
              {stats.fiveStarHistory.length === 0 ? (
                <p className="px-5 py-8 text-[13px] text-[var(--text-muted)] sm:px-6">
                  No five-star pulls in this banner history yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left">
                    <thead>
                      <tr className="text-[10.5px] font-mono uppercase tracking-[0.1em] text-[var(--text-dim)]">
                        <th className="px-5 py-3 font-normal sm:px-6">Pull</th>
                        <th className="px-4 py-3 font-normal">Pity</th>
                        <th className="px-5 py-3 text-right font-normal sm:px-6">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.fiveStarHistory.map((wish) => {
                        const portraitUrl = characterPortraitUrl(wish.name);
                        return (
                          <tr key={wish.id} className="border-t border-[var(--border-subtle)] text-[13px]">
                            <td className="px-5 py-2.5 font-medium text-[var(--text-primary)] sm:px-6">
                              <div className="flex min-h-9 items-center gap-3">
                                {portraitUrl ? (
                                  // Paimon.moe maintains these small Genshin portrait assets in its public repository.
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={portraitUrl}
                                    alt={`${wish.name} portrait`}
                                    width={36}
                                    height={36}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-9 w-9 shrink-0 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] object-cover"
                                  />
                                ) : null}
                                <span>{wish.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[var(--text-muted)]">
                              {wish.pity === null ? (
                                "—"
                              ) : (
                                <span
                                  aria-label={`Pity ${wish.pity} of ${banner.hardPity}`}
                                  style={getPityScaleStyle(wish.pity, banner.hardPity)}
                                  className={`${styles.pity} items-center justify-center rounded-full border px-2.5 py-1 text-[11.5px] font-semibold tabular-nums`}
                                >
                                  {wish.pity}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-2.5 text-right text-[var(--text-muted)] sm:px-6">
                              {formatDate(wish.time)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
