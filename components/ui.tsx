import type { ReactNode } from "react";

export type Tone = "ok" | "warn" | "risk" | "info" | "ai" | "idle" | "accent";

export function Chip({
  tone = "idle",
  children,
  plain,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  plain?: boolean;
  className?: string;
}) {
  if (plain) return <span className={`tag ${className}`}>{children}</span>;
  return <span className={`chip chip-${tone} ${className}`}>{children}</span>;
}

/** Everything an AI made carries a draft stamp until a person accepts it. */
export function AiTag({ accepted }: { accepted?: boolean }) {
  return accepted ? <span className="text-[12px] text-[var(--ok)]">AI draft, accepted</span> : <span className="chip chip-ai">AI draft</span>;
}

/**
 * A sheet of paper with a heading. `kicker` is a one-line description that sits
 * under the heading, not a label above it.
 */
export function Panel({
  title,
  kicker,
  right,
  children,
  className = "",
  id,
}: {
  title: ReactNode;
  kicker?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`card flex flex-col gap-4 ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5" title={kicker}>
          <h2 className="h-panel">{title}</h2>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

export function Meter({ value, color, label }: { value: number; color?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-label={label}>
      <span style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  tone,
  children,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "accent" | "risk" | "ok" | "warn";
  children?: ReactNode;
}) {
  const color = tone === "risk" ? "var(--risk)" : tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : "var(--ink)";
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-[var(--rule-2)] pl-4">
      <span className="text-[13px] text-[var(--ink-2)]">{label}</span>
      <div className="display text-[46px]" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[12.5px] muted">{sub}</div>}
      {children}
    </div>
  );
}

/** Same three shapes everywhere: signed = solid, active = half, locked = ring. */
export function StageGlyph({ state, size = 12 }: { state: "passed" | "active" | "locked"; size?: number }) {
  const label = state === "passed" ? "Gate signed" : state === "active" ? "In progress" : "Not started";
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      {state === "passed" && (
        <>
          <circle cx="6" cy="6" r="6" fill="var(--ink)" />
          <path d="m3.4 6.2 1.7 1.6 3.4-3.6" stroke="#060607" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {state === "active" && (
        <>
          <circle cx="6" cy="6" r="5.25" fill="none" stroke="var(--brand)" strokeWidth="1.5" />
          <path d="M6 .75A5.25 5.25 0 0 1 6 11.25Z" fill="var(--brand)" />
        </>
      )}
      {state === "locked" && <circle cx="6" cy="6" r="5.25" fill="none" stroke="var(--faint)" strokeWidth="1.5" />}
    </svg>
  );
}

export const agentTone = { done: "ok", working: "info", needs: "warn", idle: "idle" } as const;
export const agentLabel = { done: "Done", working: "Working", needs: "Needs you", idle: "Not started" } as const;
export const sevTone = { high: "risk", medium: "warn", low: "idle" } as const;

const AVATAR_TINTS = ["#2a3150", "#1f3b30", "#3d3420", "#30284a", "#46262d", "#1f3442"];

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const clean = name.replace(/\(.*\)/, "").trim();
  const initials = clean
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const tint = AVATAR_TINTS[[...clean].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: tint, color: "var(--ink)" }}
    >
      {initials}
    </span>
  );
}
