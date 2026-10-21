"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { PageHeader, Timeline } from "@/components/pipeline/parts";
import { Chip, StageGlyph, agentLabel, agentTone } from "@/components/ui";
import { GUARDIANS, ROLES, STAGES } from "@/lib/data";

function Link_({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 pl-[22px]" aria-hidden>
      <span className="h-7 w-[2px] bg-[var(--brand)]" />
      {label && <span className="text-[13px] text-[var(--ink-2)]">{label}</span>}
    </div>
  );
}

function Layer({ name, children, strong, stacked }: { name: string; children: ReactNode; strong?: boolean; stacked?: boolean }) {
  return (
    <div className={`grid h-full gap-x-6 gap-y-2 rounded-md border px-5 py-4 ${stacked ? "" : "md:grid-cols-[200px_1fr]"} ${strong ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--rule-2)] bg-[var(--sheet)]"}`}>
      <span className={`title-wide text-[17px] leading-tight ${strong ? "text-[var(--brand-ink)]" : ""}`}>{name}</span>
      <div className="text-[14px] text-[var(--ink-2)]">{children}</div>
    </div>
  );
}

export function PipelineMap() {
  const { stageState } = useBrain();
  const [open, setOpen] = useState<string | null>("prep");
  const agentCount = STAGES.reduce((s, x) => s + x.agents.length, 0);

  return (
    <>
      <PageHeader
        title="How it runs"
        sub={`Every film moves through nine stages. ${agentCount} specialist agents do the groundwork, ${GUARDIANS.length} guardians check it, and nothing moves to the next stage until the right people sign the gate.`}
      />

      <Timeline />

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col">
          <Layer name="Your team">{ROLES.map((r) => r.label).join(", ")}. Each person sees a home screen made for their role.</Layer>
          <Link_ label="Sign-offs go down. Drafts and flags come back up." />
          <Layer name="SHI Orchestrator" strong>
            Knows which stage the film is in, wakes the right agents, hands work between them, and stops at every gate until people sign. A gate can wait days without losing anything.
          </Layer>
          <Link_ />
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-md border border-[var(--rule-2)] bg-[var(--sheet)] px-5 py-4">
              <span className="title-wide text-[17px]">Stage agents</span>
              <p className="mb-3 text-[13.5px] text-[var(--ink-2)]">Four to eight per stage, each with one job.</p>
              <ul className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {STAGES.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => setOpen(s.id)} className={`flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[13.5px] hover:bg-[var(--sheet-2)] ${open === s.id ? "font-semibold text-[var(--brand-ink)]" : ""}`}>
                      <StageGlyph state={stageState(s.id)} size={11} />
                      {s.name}
                      <span className="ml-auto mono text-[12.5px] muted">{s.agents.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-[var(--rule-2)] bg-[var(--sheet)] px-5 py-4">
              <span className="title-wide text-[17px]">Guardians</span>
              <p className="mb-3 text-[13.5px] text-[var(--ink-2)]">Check, never create.</p>
              <ul className="flex flex-col gap-1 text-[13.5px]">
                {GUARDIANS.map((g) => (
                  <li key={g.id}>
                    <Link href="/guardians" className="hover:text-[var(--brand)]">
                      {g.name.replace(" Guardian", "")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link_ label="Every agent reads and writes here, so nothing is typed twice." />
          <Layer name="Project Brain">One shared memory per film: story bible, script versions, budget, schedule, assets, contracts and every approval.</Layer>
          <Link_ />
          <div className="grid gap-3 md:grid-cols-2">
            <Layer stacked name="Model gateway">Picks the right model for text, images, video and voice.</Layer>
            <Link href="/brain" className="block hover:[&>div]:border-[var(--ink)]">
              <Layer stacked name="Activity log">Every action, by an agent or a person, with who accepted it.</Layer>
            </Link>
          </div>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <div className="card flex flex-col gap-3 !border-[var(--brand)] bg-[linear-gradient(180deg,rgba(212,255,58,0.08),transparent)]">
            <h2 className="title-wide text-[20px]">The one rule</h2>
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              An agent can write a draft, raise a flag or make a suggestion. Only a person with the right role can approve, lock, sign, spend or publish.
            </p>
            <p className="text-[14px] text-[var(--ink-2)]">
              Anything an AI made stays marked <span className="chip chip-ai">AI draft</span> until someone accepts it, and every action lands in the activity log.
            </p>
          </div>
          <p className="text-[13.5px] muted">Pick a stage on the left, or below, to see its agents and its gate.</p>
        </aside>
      </section>

      <section className="flex flex-col gap-2">
        {STAGES.map((s) => {
          const st = stageState(s.id);
          const isOpen = open === s.id;
          return (
            <article key={s.id} className={`card !p-0 ${isOpen ? "!border-[var(--rule-2)]" : ""}`}>
              <button className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
                <StageGlyph state={st} size={14} />
                <span className="title-wide text-[18px]">{s.name}</span>
                <span className="text-[13.5px] muted">{s.dashboard}, {s.agents.length} agents</span>
                <svg className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-4 border-t border-[var(--rule)] px-5 py-5">
                  <p className="max-w-[80ch] text-[14.5px] text-[var(--ink-2)]">
                    {s.goal} It starts from {s.input.charAt(0).toLowerCase() + s.input.slice(1)} and hands over {s.output.charAt(0).toLowerCase() + s.output.slice(1)}
                  </p>
                  <div className="thin-scroll overflow-x-auto">
                    <table className="tbl min-w-[680px]">
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>What it does</th>
                          <th>Writes to the Project Brain</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.agents.map((a) => {
                          const status = st === "passed" ? "done" : st === "locked" ? "idle" : a.status === "idle" ? "working" : a.status;
                          return (
                            <tr key={a.name}>
                              <td className="font-semibold whitespace-nowrap !text-[var(--ink)]">{a.name.replace(/ Agent$/, "")}</td>
                              <td>{a.does}</td>
                              <td>{a.writes}</td>
                              <td>
                                <Chip tone={agentTone[status]}>{agentLabel[status]}</Chip>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-[var(--sheet-2)] px-4 py-3">
                    <span className="max-w-[80ch] text-[14px]">
                      <b>
                        Gate {s.n}, {s.gate.name}.
                      </b>{" "}
                      <span className="text-[var(--ink-2)]">{s.gate.rule}</span>
                    </span>
                    <Link href={`/stages/${s.id}`} className="btn btn-sm">
                      Open {s.dashboard}
                    </Link>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
