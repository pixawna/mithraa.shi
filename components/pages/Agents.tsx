"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { Still, type Scene } from "@/components/media/Still";
import { useRun, typed } from "@/components/studio/useRun";
import { AiTag, Chip, Meter, agentLabel, agentTone } from "@/components/ui";
import { GUARDIANS, PROJECT, STAGES, type Agent, type StageId } from "@/lib/data";

const STAGE_TINT: Record<string, string> = {
  ideate: "#e0457b",
  develop: "#8a5cf6",
  write: "#2d5bd8",
  protect: "#14a39a",
  finance: "#f08a24",
  prep: "#5a7a10",
  production: "#c2410c",
  post: "#0e7490",
  release: "#b45309",
  guardian: "#3a3d42",
};

const SCENES: Scene[] = ["radio", "river-ghat", "kitchen", "land-office", "market", "temple-street", "station-night", "terrace-night", "dawn-courtyard", "kolam", "ferry", "salt"];

type Item = {
  key: string;
  name: string;
  does: string;
  writes: string;
  task: string;
  stage: StageId | "guardian";
  stageName: string;
  status: Agent["status"];
  scene: Scene;
  budgetK?: number;
  spentK?: number;
};

export function Agents() {
  const { stageState } = useBrain();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Item | null>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    let k = 0;
    STAGES.forEach((s) =>
      s.agents.forEach((a, ai) => {
        const st = stageState(s.id);
        const status = st === "passed" ? "done" : st === "locked" ? "idle" : a.status === "idle" ? "working" : a.status;
        out.push({ key: `${s.id}-${ai}`, name: a.name.replace(/ Agent$/, ""), does: a.does, writes: a.writes, task: a.task, stage: s.id, stageName: s.name, status, scene: SCENES[k++ % SCENES.length], budgetK: a.budgetK, spentK: a.spentK });
      }),
    );
    GUARDIANS.forEach((g) =>
      out.push({ key: g.id, name: g.name.replace(" Guardian", ""), does: `Watches ${g.watches.charAt(0).toLowerCase()}${g.watches.slice(1)}.`, writes: "Flags with evidence", task: `${g.checksToday} checks today`, stage: "guardian", stageName: "Guardian", status: "working", scene: SCENES[k++ % SCENES.length] }),
    );
    return out;
  }, [stageState]);

  const list = items.filter((i) => (filter === "all" ? true : filter === "live" ? i.status === "working" || i.status === "needs" : i.stage === filter)).filter((i) => !q || `${i.name} ${i.does}`.toLowerCase().includes(q.toLowerCase()));
  const live = items.filter((i) => i.status === "working" || i.status === "needs").length;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="display text-[40px] md:text-[56px]">Agents</h1>
        <p className="text-[14.5px] text-[var(--ink-2)]">44 stage agents do the work. 7 guardians check it. Open one to run a sample on {PROJECT.title}.</p>
      </header>

      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center gap-2 bg-[rgba(15,17,19,0.9)] px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {[["all", "All"], ["live", `Running now (${live})`], ...STAGES.map((s) => [s.id, s.name]), ["guardian", "Guardians"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-[10px] px-3 py-1.5 text-[13.5px] ${filter === k ? "bg-white/[0.07] font-medium text-[var(--brand)]" : "text-[var(--ink-2)] hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents" aria-label="Search agents" className="ml-auto h-9 w-full rounded-[10px] bg-[var(--sheet)] px-3.5 text-[13px] outline-none placeholder:text-[var(--faint)] sm:w-56" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((a) => {
          const live = a.status === "working" || a.status === "needs";
          return (
            <button key={a.key} onClick={() => setOpen(a)} className="group flex min-h-[132px] flex-col gap-2 rounded-[16px] border border-white/[0.05] bg-[var(--sheet)] p-4 text-left transition-colors hover:bg-[var(--sheet-3)]">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px]" style={{ background: STAGE_TINT[a.stage] }} aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={a.stage === "guardian" ? "#fff" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={a.stage === "guardian" ? "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" : "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"} />
                  </svg>
                </span>
                {live ? (
                  <span className={`rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold ${a.status === "needs" ? "bg-[var(--haldi)] text-black" : "bg-[var(--brand)] text-[var(--on-brand)]"}`}>{a.status === "needs" ? "Needs you" : "Live"}</span>
                ) : (
                  <span className="text-[11.5px] muted">{a.stageName}</span>
                )}
              </div>
              <span className="mt-auto text-[14.5px] font-medium">{a.name}</span>
              <span className="line-clamp-2 text-[12.5px] leading-snug text-[var(--muted)]">{a.does}</span>
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-[14px] muted">No agent matches that search.</p>}

      {open && <AgentDrawer agent={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function AgentDrawer({ agent, onClose }: { agent: Item; onClose: () => void }) {
  const { log } = useBrain();
  const run = useRun([
    { id: "read", ms: 1400 },
    { id: "work", ms: 2600 },
    { id: "write", ms: 1200 },
  ]);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const lines = [
    { id: "read", text: `Reading the Project Brain for ${PROJECT.title}: locked script, Story Bible, ${PROJECT.scenes} scenes.` },
    { id: "work", text: agent.stage === "guardian" ? `Checking every new draft and spend against what was approved.` : `${agent.does}.` },
    { id: "write", text: `Writing back to the Brain as an AI draft: ${agent.writes}.` },
  ];
  const isGuardian = agent.stage === "guardian";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
      <aside role="dialog" aria-label={agent.name} className="rise flex h-full w-full max-w-[520px] flex-col overflow-y-auto border-l border-[var(--rule-2)] bg-[#0d0d10]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="media media-fade aspect-[16/9] shrink-0 !rounded-none">
          <Still scene={agent.scene} letterbox />
          <button onClick={onClose} className="glass absolute top-3 right-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="media-label flex flex-col gap-1">
            <span className="text-[13px] text-white/75">{isGuardian ? "Guardian, runs across every stage" : `${agent.stageName} stage agent`}</span>
            <span className="display text-[52px] leading-none text-white">{agent.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">{agent.does}</p>
          <dl className="grid grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <dt className="muted">Writes to the Brain</dt>
              <dd className="font-semibold">{agent.writes}</dd>
            </div>
            <div>
              <dt className="muted">Now</dt>
              <dd>
                <Chip tone={agentTone[agent.status]}>{agentLabel[agent.status]}</Chip>
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="muted">Latest work</dt>
              <dd className="font-semibold">{agent.task}</dd>
            </div>
            {agent.budgetK ? (
              <div className="col-span-2 flex flex-col gap-1.5">
                <dt className="flex justify-between muted">
                  Model spend on this film <span className="mono text-[var(--ink-2)]">₹{agent.spentK}k of ₹{agent.budgetK}k</span>
                </dt>
                <dd>
                  <Meter value={((agent.spentK ?? 0) / agent.budgetK) * 100} color="var(--ai)" label="Agent spend" />
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--rule)] bg-black/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold">Sample run</span>
              {run.started && <span className="mono text-[12px] muted">{(run.elapsed / 1000).toFixed(1)}s</span>}
            </div>
            {!run.started ? (
              <p className="text-[13.5px] muted">Runs this agent on {PROJECT.title} with the Brain as it is now. Nothing is saved until a person accepts it.</p>
            ) : (
              <ol className="flex flex-col gap-2 font-[family-name:var(--font-body)] text-[13.5px]">
                {lines.map((l) => {
                  const p = run.progress(l.id);
                  if (p === 0) return null;
                  return (
                    <li key={l.id} className="flex gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${p >= 1 ? "bg-[var(--brand)]" : "bg-white/30"}`} />
                      <span className={p < 1 ? "caret text-[var(--ink)]" : "text-[var(--ink-2)]"}>{typed(l.text, p)}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            {run.done && (
              <div className="rise flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] pt-3">
                <span className="flex items-center gap-2 text-[13.5px]">
                  {agent.writes} <AiTag accepted={accepted} />
                </span>
                {!accepted && !isGuardian && (
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      setAccepted(true);
                      log("accepted", `${agent.name}: ${agent.writes}`);
                    }}
                  >
                    Accept draft
                  </button>
                )}
              </div>
            )}
            <button className="btn btn-primary" onClick={run.start} disabled={run.started && !run.done}>
              {run.started && !run.done ? "Running" : run.done ? "Run again" : `Run ${agent.name}`}
            </button>
          </div>

          {!isGuardian && (
            <Link href={`/stages/${agent.stage}`} className="btn">
              Open {STAGES.find((s) => s.id === agent.stage)?.dashboard}
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
