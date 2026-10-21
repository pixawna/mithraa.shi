"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { AiTag, Avatar, Chip, Panel, StageGlyph, agentLabel, agentTone, sevTone } from "@/components/ui";
import { APPROVALS, FEED, FLAGS, STAGES, TODAY, roleById, type Stage, type StageId } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Page header                                                          */
/* ------------------------------------------------------------------ */

export function PageHeader({ eyebrow, title, sub, right }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="flex max-w-[780px] flex-col gap-3">
        {eyebrow && <div className="text-[13px] text-[var(--muted)]">{eyebrow}</div>}
        <h1 className="display text-[40px] md:text-[56px]">{title}</h1>
        {sub && <p className="max-w-[64ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Production timeline — the pipeline as an editor's timeline          */
/* ------------------------------------------------------------------ */

const T0 = Date.parse("2026-06-01");
const T1 = Date.parse("2027-07-01");
const DAY = 86_400_000;
const pct = (iso: string) => ((Date.parse(iso) - T0) / (T1 - T0)) * 100;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const MONTHS = Array.from({ length: 13 }, (_, i) => {
  const d = new Date(2026, 5 + i, 1);
  return { iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`, label: d.toLocaleDateString("en-GB", { month: "short" }), year: d.getMonth() === 0 ? d.getFullYear() : null };
});

export function Timeline() {
  const { stageState, checks, role, passed } = useBrain();
  const allowed = roleById(role).stages;
  const today = pct(TODAY);
  const scroller = useRef<HTMLDivElement>(null);

  // On narrow screens, open the timeline scrolled to today.
  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth * today) / 100 - el.clientWidth / 2;
  }, [today]);

  return (
    <div className="card !p-0">
      <div ref={scroller} className="thin-scroll overflow-x-auto">
        <div className="relative min-w-[920px] px-5 pt-10 pb-5">
          {/* ruler */}
          <div className="relative h-7 border-b border-[var(--rule)]">
            {MONTHS.map((m) => (
              <span key={m.iso} className="absolute top-1 flex h-full items-start border-l border-[var(--rule)] pl-1.5 text-[12px] text-[var(--muted)]" style={{ left: `${pct(m.iso)}%` }}>
                {m.label}
                {m.year && <span className="ml-1 font-semibold text-[var(--ink-2)]">{m.year}</span>}
              </span>
            ))}
          </div>

          {/* tracks */}
          <div className="relative mt-3 flex flex-col gap-2">
            {[0, 1, 2].map((track) => (
              <div key={track} className="relative h-[46px] rounded-[4px] bg-[var(--sheet-2)]">
                {STAGES.filter((s) => (s.n - 1) % 3 === track).map((s) => {
                  const st = stageState(s.id);
                  const can = allowed.includes(s.id);
                  const left = pct(s.start);
                  const width = pct(s.end) - left;
                  const d = days(s.start, s.end);
                  const inside = (d / 395) * 1000 > s.name.length * 7.4 + 18;
                  const done = s.gate.items.filter((i) => checks[i.id]).length;
                  const elapsed = st === "active" ? Math.max(0.04, Math.min(1, (Date.parse(TODAY) - Date.parse(s.start)) / (Date.parse(s.end) - Date.parse(s.start)))) : 0;
                  const style =
                    st === "passed"
                      ? "bg-[#2a2a31] text-[var(--ink)]"
                      : st === "active"
                        ? "bg-[var(--brand-soft)] text-[var(--brand-ink)] ring-1 ring-[var(--brand)] ring-inset"
                        : "border border-dashed border-[var(--rule-2)] bg-[var(--sheet)] text-[var(--muted)]";
                  const tip = `${s.name}: ${fmt(s.start)} to ${fmt(s.end)}. ${st === "passed" ? `Gate ${s.n} signed ${passed[s.id] ?? ""}` : `Gate ${s.n}: ${done} of ${s.gate.items.length} ready`}`;
                  const body = (
                    <>
                      {st === "active" && <span aria-hidden className="absolute inset-y-0 left-0 bg-[var(--brand)]" style={{ width: `${elapsed * 100}%` }} />}
                      {inside && (
                        <span className={`relative truncate px-2.5 text-[13px] font-semibold ${st === "active" && elapsed > 0.5 ? "text-[var(--on-brand)]" : ""}`}>{s.name}</span>
                      )}
                      {/* gate marker at the end of the clip */}
                      <span
                        aria-hidden
                        className={`absolute -right-[7px] top-1/2 flex h-[14px] w-[14px] -translate-y-1/2 rotate-45 items-center justify-center border-2 ${
                          st === "passed" ? "border-[var(--sheet)] bg-[#8a8a94]" : st === "active" ? "border-[var(--sheet)] bg-[var(--haldi)]" : "border-[var(--rule-2)] bg-[var(--sheet)]"
                        }`}
                      />
                    </>
                  );
                  const cls = `group absolute inset-y-[5px] flex items-center overflow-hidden rounded-[3px] ${style} ${can ? "" : "opacity-40"}`;
                  return (
                    <div key={s.id} className="contents">
                      {can ? (
                        <Link href={`/stages/${s.id}`} title={tip} className={`${cls} hover:brightness-110`} style={{ left: `${left}%`, width: `${width}%`, overflow: "visible" }}>
                          {body}
                        </Link>
                      ) : (
                        <div title={`${tip} (not shared with your role)`} className={cls} style={{ left: `${left}%`, width: `${width}%`, overflow: "visible" }}>
                          {body}
                        </div>
                      )}
                      {!inside && (
                        <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 pl-3 text-[13px] font-semibold whitespace-nowrap ${st === "locked" ? "text-[var(--muted)]" : st === "active" ? "text-[var(--brand-ink)]" : "text-[var(--ink)]"}`} style={{ left: `${pct(s.end)}%` }}>
                          {s.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* playhead */}
            <div aria-hidden className="pointer-events-none absolute -top-[72px] -bottom-2 w-0" style={{ left: `${today}%` }}>
              <span className="absolute -top-0.5 left-0 -translate-x-1/2 rounded-[3px] bg-[var(--brand)] px-1.5 py-px text-[11px] font-bold whitespace-nowrap text-[var(--on-brand)]">Today {fmt(TODAY)}</span>
              <span className="absolute top-5 bottom-0 left-0 w-[2px] -translate-x-1/2 bg-[var(--brand)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--rule)] px-5 py-2.5 text-[12.5px] text-[var(--ink-2)]">
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-[2px] bg-[#2a2a31]" /> Gate signed</span>
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-[2px] bg-[linear-gradient(90deg,var(--brand)_50%,var(--brand-soft)_50%)] ring-1 ring-[var(--brand)] ring-inset" /> In progress, filled to today</span>
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-[2px] border border-dashed border-[var(--rule-2)]" /> Planned</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rotate-45 bg-[var(--haldi)]" /> Gate waiting for signatures</span>
      </div>
    </div>
  );
}

/** Back-compat name. */
export const FilmRail = Timeline;

/* ------------------------------------------------------------------ */
/* Gate checklist                                                       */
/* ------------------------------------------------------------------ */

export function GatePanel({ stage }: { stage: Stage }) {
  const { checks, toggleCheck, passGate, stageState, canSign, passed, role } = useBrain();
  const st = stageState(stage.id);
  const items = stage.gate.items;
  const done = items.filter((i) => checks[i.id]).length;
  const allDone = done === items.length;
  const mayApprove = canSign(stage.gate.approvers);

  return (
    <section id="gate" className={`card flex flex-col gap-4 ${st === "active" ? "!border-[var(--haldi)] shadow-[inset_0_4px_0_var(--haldi)]" : ""}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-[var(--muted)]">Gate {stage.n}</span>
          <h2 className="title-wide text-[22px] leading-tight">{stage.gate.name}</h2>
        </div>
        {st === "passed" ? <Chip tone="ok">Signed {passed[stage.id]}</Chip> : st === "active" ? <Chip tone="warn">{done} of {items.length} ready</Chip> : <Chip>Not open yet</Chip>}
      </header>
      <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">{stage.gate.rule}</p>
      <ul className="flex flex-col">
        {items.map((i) => {
          const on = checks[i.id];
          return (
            <li key={i.id} className="border-t border-[var(--rule)] first:border-0">
              <button onClick={() => toggleCheck(stage.id, i.id)} className="flex w-full items-center gap-3 py-2.5 text-left text-[14px]" aria-pressed={on}>
                <span
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px]"
                  style={{ borderColor: on ? "var(--ink)" : "var(--rule-2)", background: on ? "var(--ink)" : "var(--sheet)" }}
                >
                  {on && (
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                      <path d="m2.5 6.3 2.3 2.2 4.7-5" stroke="#060607" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className={on ? "text-[var(--ink)]" : "text-[var(--ink-2)]"}>{i.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-3 border-t border-[var(--rule)] pt-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[var(--muted)]">
          Signed by
          {stage.gate.approvers.map((r) => (
            <span key={r} className={`tag ${r === role ? "!border-[var(--brand)] !bg-[var(--brand-soft)] !text-[var(--brand-ink)]" : ""}`}>
              {roleById(r).label}
              {r === role && " (you)"}
            </span>
          ))}
        </div>
        {st === "active" && (
          <button
            className="btn btn-primary w-full !min-h-[40px]"
            disabled={!allDone || !mayApprove}
            onClick={() => passGate(stage.id)}
            title={!mayApprove ? "Your role can't sign this gate" : !allDone ? "Tick every item first" : undefined}
          >
            {mayApprove ? `Sign Gate ${stage.n}` : "Your role can't sign this gate"}
          </button>
        )}
        {st === "active" && mayApprove && !allDone && <p className="text-[12.5px] muted">Tick every item to sign. Signing opens {STAGES[stage.n]?.name ?? "release"}.</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage agents — a crew list, not a wall of cards                      */
/* ------------------------------------------------------------------ */

export function AgentsPanel({ stage }: { stage: Stage }) {
  const { stageState, role } = useBrain();
  const st = stageState(stage.id);
  const showCost = role === "producer";
  return (
    <Panel title={`${stage.agents.length} agents on this stage`} kicker="They draft, check and suggest. Your team approves.">
      <ul className="flex flex-col">
        {stage.agents.map((ag) => {
          const woken = st === "active" && ag.status === "idle";
          const status = st === "passed" ? "done" : st === "locked" ? "idle" : woken ? "working" : ag.status;
          return (
            <li key={ag.name} className="grid gap-x-4 gap-y-1 border-t border-[var(--rule)] py-3 first:border-0 first:pt-0 md:grid-cols-[minmax(180px,1fr)_2fr_auto]">
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold">{ag.name.replace(/ Agent$/, "")}</span>
                <span className="text-[12.5px] muted">Writes {ag.writes.charAt(0).toLowerCase() + ag.writes.slice(1)}</span>
              </div>
              <div className="flex flex-col text-[13.5px] text-[var(--ink-2)]">
                <span>{st === "locked" ? `Starts after Gate ${stage.n - 1}` : woken ? "Just started: reading the Project Brain" : ag.task}</span>
                <span className="text-[12.5px] muted">{ag.does}</span>
              </div>
              <div className="flex items-start gap-4 md:flex-col md:items-end md:gap-1">
                <Chip tone={agentTone[status]}>{agentLabel[status]}</Chip>
                {showCost && ag.spentK > 0 && (
                  <span className="mono text-[12px] muted" title="Model spend against this agent's cap on the project">
                    ₹{ag.spentK}k of ₹{ag.budgetK}k
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Approvals                                                            */
/* ------------------------------------------------------------------ */

export function ApprovalsPanel({ stage, title = "Waiting for your sign-off" }: { stage?: StageId; title?: string }) {
  const { role, approvals, decide } = useBrain();
  const list = APPROVALS.filter((a) => a.roles.includes(role) && (!stage || a.stage === stage));
  const pending = list.filter((a) => !approvals[a.id]).length;
  return (
    <Panel title={title} right={pending ? <Chip tone="warn">{pending} waiting</Chip> : <Chip tone="ok">All clear</Chip>}>
      {list.length === 0 && <p className="text-[13.5px] muted">Nothing for your role on this stage.</p>}
      <ApprovalRows list={list} approvals={approvals} decide={decide} />
    </Panel>
  );
}

export function ApprovalRows({
  list,
  approvals,
  decide,
}: {
  list: typeof APPROVALS;
  approvals: Record<string, "approved" | "rejected">;
  decide: (id: string, label: string, d: "approved" | "rejected") => void;
}) {
  return (
    <ul className="flex flex-col">
      {list.map((a) => {
        const d = approvals[a.id];
        return (
          <li key={a.id} className="flex flex-wrap items-center gap-3 border-t border-[var(--rule)] py-3 first:border-0 first:pt-0">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
                {a.what} {a.ai && <AiTag accepted={d === "approved"} />}
              </span>
              <span className="text-[12.5px] muted">
                From {a.from}, {STAGES.find((s) => s.id === a.stage)?.name}
              </span>
            </div>
            <div className="flex gap-1.5">
              {d ? (
                <>
                  <Chip tone={d === "approved" ? "ok" : "risk"}>{d === "approved" ? "Approved" : "Sent back"}</Chip>
                  <button className="btn btn-ghost btn-sm" onClick={() => decide(a.id, a.what, d)}>
                    Undo
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => decide(a.id, a.what, "rejected")}>
                    Send back
                  </button>
                  <button className="btn btn-sm" onClick={() => decide(a.id, a.what, "approved")}>
                    Approve
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Guardian flags                                                       */
/* ------------------------------------------------------------------ */

const sevRank = { high: 0, medium: 1, low: 2 };
const sevWord = { high: "High risk", medium: "Medium", low: "Low" };

export function FlagsPanel({ stage, onlyMine, limit, title = "Guardian flags" }: { stage?: StageId; onlyMine?: boolean; limit?: number; title?: string }) {
  const { flags, resolveFlag, role } = useBrain();
  const list = FLAGS.filter((f) => !flags[f.id])
    .filter((f) => !stage || f.stage === stage)
    .filter((f) => !onlyMine || f.owner === role)
    .sort((a, b) => sevRank[a.severity] - sevRank[b.severity])
    .slice(0, limit);
  return (
    <Panel
      title={title}
      kicker="Highest risk first. Each flag goes to the person who can fix it."
      right={
        <Link href="/guardians" className="text-[13px] font-semibold text-[var(--brand)] hover:underline">
          All guardians
        </Link>
      }
    >
      {list.length === 0 && <p className="text-[13.5px] muted">No open flags. The guardians are still watching.</p>}
      <FlagRows list={list} role={role} resolveFlag={resolveFlag} />
    </Panel>
  );
}

export function FlagRows({ list, role, resolveFlag }: { list: typeof FLAGS; role: string; resolveFlag: (id: string, label: string) => void }) {
  return (
    <ul className="flex flex-col">
      {list.map((f) => (
        <li key={f.id} className="flex flex-col gap-1.5 border-t border-[var(--rule)] py-3.5 first:border-0 first:pt-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Chip tone={sevTone[f.severity]}>{sevWord[f.severity]}</Chip>
            <span className="text-[13px] muted">{f.guardian}</span>
          </div>
          <p className="text-[14.5px] leading-snug">{f.text}</p>
          <p className="text-[12.5px] muted">Evidence: {f.evidence}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className="text-[13px] text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--ink)]">Suggested fix:</span> {f.fix}
            </span>
            {f.owner === role ? (
              <button className="btn btn-sm" onClick={() => resolveFlag(f.id, `${f.guardian}: ${f.text}`)}>
                Mark as fixed
              </button>
            ) : (
              <span className="text-[12.5px] muted">For the {roleById(f.owner as never).label}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Agent activity                                                       */
/* ------------------------------------------------------------------ */

export function FeedPanel({ stage, limit, title = "Agent activity" }: { stage?: StageId; limit?: number; title?: string }) {
  const { feed, decideFeed } = useBrain();
  const list = FEED.filter((f) => !stage || f.stage === stage).slice(0, limit);
  return (
    <Panel title={title} kicker="Suggestions wait for you to accept or ignore them.">
      <ol className="flex flex-col">
        {list.map((e) => {
          const d = feed[e.id];
          return (
            <li key={e.id} className="flex gap-3 border-t border-[var(--rule)] py-3 first:border-0 first:pt-0">
              <Avatar name={e.agent} size={28} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-semibold">{e.agent.replace(/ Agent$/, "")}</span>
                  <span className="mono shrink-0 text-[12px] muted">{e.time}</span>
                </span>
                <span className="text-[14px] text-[var(--ink-2)]">{e.text}</span>
                {e.suggestion && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {d ? (
                      <Chip tone={d === "accepted" ? "ok" : "idle"}>{d === "accepted" ? "Accepted" : "Ignored"}</Chip>
                    ) : (
                      <>
                        <button className="btn btn-sm" onClick={() => decideFeed(e.id, `${e.agent}: ${e.text}`, "accepted")}>
                          Accept
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => decideFeed(e.id, `${e.agent}: ${e.text}`, "ignored")}>
                          Ignore
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Stage brief                                                          */
/* ------------------------------------------------------------------ */

export function StageBrief({ stage }: { stage: Stage }) {
  const cells = [
    ["What this stage is for", stage.goal],
    ["Starts from", stage.input],
    ["Hands over", stage.output],
  ];
  return (
    <div className="grid gap-x-8 gap-y-4 border-y border-[var(--rule-2)] py-5 md:grid-cols-3">
      {cells.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-[var(--ink)]">{k}</span>
          <span className="text-[14px] leading-snug text-[var(--ink-2)]">{v}</span>
        </div>
      ))}
    </div>
  );
}

export { StageGlyph };
