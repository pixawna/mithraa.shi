"use client";

import { useRouter } from "next/navigation";
import { useBrain } from "@/components/brain/BrainProvider";
import { PageHeader } from "@/components/pipeline/parts";
import { Avatar } from "@/components/ui";
import { ROLES, STAGES } from "@/lib/data";

export function Roles() {
  const { role, setRole } = useBrain();
  const router = useRouter();
  return (
    <>
      <PageHeader
        title="Team views"
        sub="Everyone on the film gets a home screen built for their job, showing only the stages, flags and sign-offs they're allowed to see. Pick one to look at mithraa as that person."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((r) => (
          <article key={r.id} className={`card flex flex-col gap-3 ${role === r.id ? "!border-[var(--brand)]" : ""}`}>
            <div className="flex items-center gap-3">
              <Avatar name={r.person} size={36} />
              <div className="flex min-w-0 flex-col">
                <span className="text-[14.5px] font-semibold">{r.label}</span>
                <span className="truncate text-[12px] muted">{r.person}</span>
              </div>
            </div>
            <div className="display text-[34px]">{r.home}</div>
            <ul className="flex flex-wrap gap-1">
              {r.panels.map((p) => (
                <li key={p}>
                  <span className="tag">{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-0.5" aria-label={`Sees ${r.stages.length} of 9 stages`}>
              {STAGES.map((s) => (
                <span key={s.id} title={s.name} className="h-1.5 flex-1 rounded-full" style={{ background: r.stages.includes(s.id) ? "var(--brand)" : "var(--rule-2)" }} />
              ))}
            </div>
            <p className="text-[13px] text-[var(--ink-2)]">Can {r.actions.join(", ").toLowerCase()}.</p>
            <button
              className={`btn btn-sm mt-auto ${role === r.id ? "btn-primary" : ""}`}
              onClick={() => {
                setRole(r.id);
                router.push("/desk");
              }}
            >
              {role === r.id ? "You’re viewing as this person" : `View as ${r.person.split(/[ (]/)[0]}`}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
