"use client";

import { useBrain } from "@/components/brain/BrainProvider";
import { FlagsPanel, PageHeader } from "@/components/pipeline/parts";
import { Chip } from "@/components/ui";
import { FLAGS, GUARDIANS } from "@/lib/data";

export function Guardians() {
  const { flags } = useBrain();
  return (
    <>
      <PageHeader
        title="Guardians"
        sub="Seven checkers watch the whole film, all the time. They never make anything. When something looks wrong they raise a flag, with the evidence and a suggested fix, for the person who can fix it."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="card !p-0">
          <ul>
            {GUARDIANS.map((g) => {
              const open = FLAGS.filter((f) => f.guardian === g.name && !flags[f.id]);
              const tone = open.some((f) => f.severity === "high") ? "risk" : open.length ? "warn" : "ok";
              return (
                <li key={g.id} className="flex flex-col gap-1.5 border-t border-[var(--rule)] px-5 py-4 first:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="title-wide text-[17px]">{g.name.replace(" Guardian", "")}</h2>
                    <Chip tone={tone}>{open.length ? `${open.length} open` : "Nothing open"}</Chip>
                  </div>
                  <p className="text-[14px] text-[var(--ink-2)]">Watches {g.watches.charAt(0).toLowerCase() + g.watches.slice(1)}.</p>
                  <p className="text-[13px] muted">
                    Flags it when {g.raisesWhen.charAt(0).toLowerCase() + g.raisesWhen.slice(1)}. <span className="mono">{g.checksToday}</span> checks today.
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="flex flex-col gap-6">
          <FlagsPanel title="Open flags" />
          <section className="card flex flex-col gap-2 bg-[var(--sheet-2)]">
            <h2 className="h-panel">Monday note from the Insight agent</h2>
            <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
              Locations are four days ahead and boards are three days behind. Casting is now the thing most likely to move the Shoot Ready date. Agent model spend is at 61% of
              its caps.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
