"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
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
const PAIMON_WEAPON_ASSET_BASE =
  "https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/static/images/weapons";

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
  "--pity-color-light": string;
  "--pity-color-dark": string;
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

function weaponIconUrl(name: string) {
  const filename = name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${PAIMON_WEAPON_ASSET_BASE}/${filename}.png`;
}

function getPityScaleStyle(pity: number, hardPity: number): PityScaleStyle {
  const clamped = Math.max(1, Math.min(hardPity, pity));
  const progress = (clamped - 1) / Math.max(1, hardPity - 1);
  const hue = Math.round(128 * (1 - progress));
  const lightLightness = Math.round(43 - 10 * progress);
  const darkLightness = Math.round(68 - 6 * progress);

  return {
    color: "var(--pity-color)",
    "--pity-color-light": `hsl(${hue} 58% ${lightLightness}%)`,
    "--pity-color-dark": `hsl(${hue} 66% ${darkLightness}%)`,
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
  const latestFiveStarAsset = stats?.lastFiveStar?.name === "Ineffa"
    ? "/genshin-wish-counter/ineffa-feature.webp"
    : stats?.lastFiveStar?.name === "Primordial Jade Winged-Spear"
      ? "/genshin-wish-counter/primordial-jade-winged-spear.png"
      : stats?.lastFiveStar
        ? stats.lastFiveStar.itemType === "Character"
          ? characterPortraitUrl(stats.lastFiveStar.name)
          : weaponIconUrl(stats.lastFiveStar.name)
        : null;
  const latestFiveStarUsesWideArt = stats?.lastFiveStar?.name === "Ineffa";

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
          <section className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--card-shadow)]">
            <div
              role="region"
              aria-label="Latest 5★"
              className="relative min-h-[310px] overflow-hidden bg-[var(--bg-card-hover)] sm:min-h-[340px]"
            >
              {latestFiveStarAsset ? (
                <>
                  {/* Feature artwork is cached locally from the source noted in the Implementation section. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latestFiveStarAsset}
                    alt=""
                    aria-hidden="true"
                    className={`absolute inset-0 h-full w-full ${
                      latestFiveStarUsesWideArt
                        ? "object-cover object-center"
                        : "object-contain object-[72%_center] p-10 sm:p-14"
                    }`}
                  />
                  <div
                    data-hero-taper="true"
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, color-mix(in srgb, var(--bg-card) 70%, transparent) 0%, color-mix(in srgb, var(--bg-card) 50%, transparent) 14%, color-mix(in srgb, var(--bg-card) 24%, transparent) 28%, transparent 44%)",
                    }}
                  />
                </>
              ) : null}

              <div
                role="region"
                aria-label="Pity"
                className="relative z-20 mx-5 mt-5 px-4 py-4 sm:absolute sm:left-5 sm:top-5 sm:m-0 sm:w-[180px]"
              >
                <p className={`${styles.fiveStarPity} text-[11px] font-mono uppercase tracking-[0.1em]`}>
                  5★ pity
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    aria-label={`Current 5★ pity ${stats.currentFiveStarPity} of ${banner.hardPity}`}
                    className={`${styles.fiveStarPity} text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[44px]`}
                  >
                    {stats.currentFiveStarPity}
                  </span>
                  <span className="text-[17px] font-medium text-[var(--text-dim)]">
                    / {banner.hardPity}
                  </span>
                </div>

                <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <p className={`${styles.fourStarPity} text-[11px] font-mono uppercase tracking-[0.1em]`}>
                    4★ pity
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      aria-label={`Current 4★ pity ${stats.currentFourStarPity} of 10`}
                      className={`${styles.fourStarPity} text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[44px]`}
                    >
                      {stats.currentFourStarPity}
                    </span>
                    <span className="text-[17px] font-medium text-[var(--text-dim)]">/ 10</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-[var(--text-dim)]">
                    Latest 5★
                  </p>
                  <p className="mt-2 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)] font-[var(--font-heading)]">
                    {stats.lastFiveStar?.name ?? "No five-star yet"}
                  </p>
                </div>

                {bannerType === "character" && stats.guaranteedNextFiveStar ? (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-primary)]">
                    <ShieldCheck aria-hidden="true" size={13} />
                    Guaranteed
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Total wishes" value={stats.totalWishes.toLocaleString("en-US")} />
            <Metric label="Five-stars" value={stats.fiveStarCount.toLocaleString("en-US")} />
            <Metric label="Average 5★ pity" value={formatAverage(stats.averageFiveStarPity)} />
          </dl>

          <section className="space-y-3" aria-labelledby="five-star-history-heading">
            <div className="px-1">
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
                        const itemIconUrl =
                          wish.itemType === "Character"
                            ? portraitUrl
                            : weaponIconUrl(wish.name);
                        return (
                          <tr key={wish.id} className="border-t border-[var(--border-subtle)] text-[13px]">
                            <td className="px-5 py-2.5 font-medium text-[var(--text-primary)] sm:px-6">
                              <div className="flex min-h-9 items-center gap-3">
                                {itemIconUrl ? (
                                  // Paimon.moe maintains these small Genshin portrait assets in its public repository.
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={itemIconUrl}
                                    alt={
                                      wish.itemType === "Character"
                                        ? `${wish.name} portrait`
                                        : `${wish.name} icon`
                                    }
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
                                  className={`${styles.pity} text-[12px] font-semibold tabular-nums`}
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

          <section aria-labelledby="about-heading" className="grid gap-7 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-[0.8fr_1.2fr] sm:gap-10">
            <div>
              <h2 id="about-heading" className="text-[15px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">About</h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-[1.75] text-[var(--text-muted)]">An at-a-glance view of my saved Genshin Impact wish history across Character, Weapon, and Standard banners. It tracks current 5★ and 4★ pity, totals, average 5★ pity, and the five-star pulls behind those numbers.</p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">Implementation</h3>
              <p className="mt-2 text-[14px] leading-[1.75] text-[var(--text-muted)]">Wish history is pulled privately from HoYoVerse, cleaned into a consistent format, and combined with older records I had already saved through Paimon.moe. The page then calculates pity and pull statistics from that history before publishing only the sanitized results to the site. Character and weapon artwork is sourced from community-maintained Genshin resources, including the Genshin Wiki and Paimon.moe. The temporary credentials used to refresh the data never become part of the public dataset.</p>
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
