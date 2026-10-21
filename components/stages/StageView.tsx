"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { Still, type Scene } from "@/components/media/Still";
import { ApprovalsPanel, GatePanel } from "@/components/pipeline/parts";
import { Chip, StageGlyph, agentLabel, agentTone } from "@/components/ui";
import { PROJECT, STAGES, roleById, type Stage, type StageId } from "@/lib/data";
import { IdeaStudio, StoryRoom, Vault, WritersRoom } from "./early";
import { DealRoom, PrepControl } from "./middle";
import { PostSuite, ProductionCommand, ReleaseHub } from "./late";

export const DASH: Record<StageId, ComponentType> = {
  ideate: IdeaStudio,
  develop: StoryRoom,
  write: WritersRoom,
  protect: Vault,
  finance: DealRoom,
  prep: PrepControl,
  production: ProductionCommand,
  post: PostSuite,
  release: ReleaseHub,
};

const STAGE_SCENE: Record<StageId, Scene> = {
  ideate: "kolam",
  develop: "river-ghat",
  write: "kitchen",
  protect: "land-office",
  finance: "market",
  prep: "dawn-courtyard",
  production: "station-night",
  post: "terrace-night",
  release: "temple-street",
};

export function StageView({ id }: { id: StageId }) {
  const { stageState, role, checks, passed } = useBrain();
  const stage = STAGES.find((s) => s.id === id)!;
  const st = stageState(id);
  const r = roleById(role);
  const Dash = DASH[id];
  const prev = STAGES[stage.n - 2];
  const done = stage.gate.items.filter((i) => checks[i.id]).length;
  const visible = r.stages.includes(id);

  return (
    <>
      {/* Project header */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="media aspect-[16/10] w-[88px] shrink-0 !rounded-[12px]">
            <Still scene={STAGE_SCENE[id]} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[12.5px] muted">
              {PROJECT.title}, stage {stage.n} of 9
            </span>
            <h1 className="display text-[34px] md:text-[44px]">{stage.dashboard}</h1>
          </div>
          <a href="#gate" className={`ml-auto flex items-center gap-3 rounded-[14px] px-4 py-2.5 text-[13px] ${st === "active" ? "bg-[var(--haldi-soft)] text-[var(--haldi-ink)]" : "bg-[var(--sheet)] text-[var(--ink-2)]"}`}>
            <span className={`h-2.5 w-2.5 rotate-45 ${st === "passed" ? "bg-[var(--ok)]" : st === "active" ? "bg-[var(--haldi)]" : "border border-white/30"}`} />
            <span>
              Gate {stage.n}, {stage.gate.name}: {st === "passed" ? `signed ${passed[id] ?? ""}` : st === "active" ? `${done} of ${stage.gate.items.length} ready` : "not open"}
            </span>
          </a>
        </div>
        <StageTabs current={id} />
      </header>

      {!visible ? (
        <div className="card flex max-w-[640px] flex-col items-start gap-3">
          <p className="text-[15px] text-[var(--ink-2)]">
            The {stage.dashboard} isn&apos;t shared with the {r.label} role. Access rules apply to agents too, so nothing from this stage reaches your screen.
            Switch who you&apos;re viewing as in the top bar to see it.
          </p>
          <Link href="/desk" className="btn btn-sm">
            Back to {r.home}
          </Link>
        </div>
      ) : (
        <>
          {st === "locked" && (
            <p className="rounded-[14px] bg-[var(--sheet)] px-4 py-3 text-[13.5px] text-[var(--ink-2)]">
              Preview with sample data. Opens after Gate {stage.n - 1}, {prev?.gate.name}.
            </p>
          )}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-6">
              <Dash />
            </div>
            <aside className="flex flex-col gap-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-48px)] xl:self-start xl:overflow-y-auto xl:pb-4 thin-scroll">
              <GatePanel stage={stage} />
              <RunQueue stage={stage} />
              {st === "active" && <ApprovalsPanel stage={id} title="Sign-offs" />}
            </aside>
          </div>
        </>
      )}
    </>
  );
}

function StageTabs({ current }: { current: StageId }) {
  const { stageState, role } = useBrain();
  const allowed = roleById(role).stages;
  return (
    <nav aria-label="Stages" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-[var(--rule)] pb-3">
      {STAGES.map((s) => {
        const st = stageState(s.id);
        const on = s.id === current;
        const can = allowed.includes(s.id);
        return (
          <Link
            key={s.id}
            href={`/stages/${s.id}`}
            aria-current={on ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-1.5 text-[13.5px] ${on ? "bg-white/[0.07] font-medium text-[var(--brand)]" : "text-[var(--ink-2)] hover:text-white"} ${can ? "" : "opacity-35"}`}
          >
            <StageGlyph state={st} size={11} />
            {s.name}
          </Link>
        );
      })}
    </nav>
  );
}

/** The live queue: every agent on the stage and what it is doing right now. */
function RunQueue({ stage }: { stage: Stage }) {
  const { stageState } = useBrain();
  const st = stageState(stage.id);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (st !== "active") return;
    const t = setInterval(() => setTick((v) => v + 1), 700);
    return () => clearInterval(t);
  }, [st]);

  const running = stage.agents.filter((a) => st === "active" && (a.status === "working" || a.status === "idle")).length;

  return (
    <section className="card flex flex-col gap-3 !p-4">
      <header className="flex items-center justify-between px-1">
        <h2 className="h-panel">Agents</h2>
        {st === "active" ? (
          <span className="flex items-center gap-2 text-[12.5px] text-[var(--ink-2)]">
            <span className="rec" /> {running} running
          </span>
        ) : (
          <Chip tone={st === "passed" ? "ok" : "idle"}>{st === "passed" ? "All done" : "Waiting"}</Chip>
        )}
      </header>
      <ol className="flex flex-col">
        {stage.agents.map((a, i) => {
          const woken = st === "active" && a.status === "idle";
          const status = st === "passed" ? "done" : st === "locked" ? "idle" : woken ? "working" : a.status;
          const base = st === "active" && status === "working" ? ((a.spentK / a.budgetK) * 100 + ((tick + i * 3) % 10) * 1.2) % 100 : status === "done" ? 100 : 0;
          return (
            <li key={a.name} className="flex flex-col gap-1.5 rounded-xl px-2 py-2.5 hover:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold">{a.name.replace(/ Agent$/, "")}</span>
                <Chip tone={agentTone[status]}>{agentLabel[status]}</Chip>
              </div>
              <span className="text-[12.5px] muted">{st === "locked" ? `Starts after Gate ${stage.n - 1}` : woken ? "Just started: reading the Project Brain" : a.task}</span>
              {status === "working" && (
                <span className="relative h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand)] transition-[width] duration-700" style={{ width: `${Math.max(8, base)}%` }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
