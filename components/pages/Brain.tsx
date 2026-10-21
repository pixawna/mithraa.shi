"use client";

import { useState } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { PageHeader } from "@/components/pipeline/parts";
import { Avatar, Panel } from "@/components/ui";
import { BRAIN_SECTIONS, PROJECT } from "@/lib/data";

export function Brain() {
  const { audit } = useBrain();
  const [who, setWho] = useState<"all" | "agent" | "person">("all");
  const list = audit.filter((a) => who === "all" || a.kind === who);

  return (
    <>
      <PageHeader
        eyebrow={`${PROJECT.title}, project ${PROJECT.code}`}
        title="Project Brain"
        sub="Everything the film knows, in one place. Agents read from it and write back to it, so nothing is typed twice between stages. Agents only see projects their person can see."
      />

      <section className="card !p-0">
        <div className="thin-scroll overflow-x-auto">
          <table className="tbl min-w-[560px]">
            <thead>
              <tr>
                <th className="!pl-5">What&apos;s stored</th>
                <th className="text-right">Records</th>
                <th className="!pr-5">Mostly written by</th>
              </tr>
            </thead>
            <tbody>
              {BRAIN_SECTIONS.map((b) => (
                <tr key={b.k}>
                  <td className="!pl-5 font-semibold !text-[var(--ink)]">{b.k}</td>
                  <td className="text-right">{b.n.toLocaleString("en-IN")}</td>
                  <td className="!pr-5">{b.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Panel
        title="Activity log"
        kicker="Every action by an agent or a person. Approve something elsewhere and it shows up here."
        right={
          <div role="tablist" className="flex gap-1">
            {(["all", "person", "agent"] as const).map((k) => (
              <button key={k} role="tab" aria-selected={who === k} className={`btn btn-sm ${who === k ? "!border-[var(--ink)]" : "btn-ghost"}`} onClick={() => setWho(k)}>
                {k === "all" ? "All" : k === "person" ? "People" : "Agents"}
              </button>
            ))}
          </div>
        }
      >
        <ol className="flex flex-col">
          {list.map((a, i) => (
            <li key={i} className="grid grid-cols-[52px_28px_1fr] items-start gap-3 border-b border-[var(--line)] py-2.5 last:border-0 sm:grid-cols-[60px_28px_1fr_auto]">
              <span className="mono pt-1 text-[12px] muted">{a.t}</span>
              <Avatar name={a.actor} size={26} />
              <span className="text-[13px] leading-snug">
                <b className="font-semibold">{a.actor}</b> <span className="muted">{a.action}</span> {a.target}
              </span>
              <span className="hidden text-[12.5px] muted sm:block">{a.kind === "agent" ? "Agent" : "Person"}</span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Ground rules built into the Brain">
        <ul className="grid gap-2 text-[13px] text-[var(--ink-2)] md:grid-cols-2">
          {[
            "Anything an AI made is marked as an AI draft until a person accepts it.",
            "Voice and likeness work (dubbing, look-tests) needs recorded consent from the person.",
            "Agents only see projects their user can see; row-level security applies to agents too.",
            "Each agent has a cost budget per project, shown to the producer.",
          ].map((g) => (
            <li key={g} className="border-l-2 border-[var(--brand)] pl-3">
              {g}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
