"use client";

import Link from "next/link";
import { useBrain } from "@/components/brain/BrainProvider";
import { ApprovalRows, FeedPanel, FlagRows, GatePanel, Timeline } from "@/components/pipeline/parts";
import { Chip, Meter, Panel } from "@/components/ui";
import { APPROVALS, FLAGS, FUNDERS, PROJECT, STAGES, roleById, type RoleId } from "@/lib/data";

/** Where each role panel lives, so every home screen links into the right stage. */
const PANEL_HOME: Record<string, string> = {
  "Story approvals": "/stages/develop",
  "Boards & look approvals": "/stages/prep",
  Dailies: "/stages/production",
  "Cut versions": "/stages/post",
  "Script editor": "/stages/write",
  Coverage: "/stages/write",
  "Notes inbox": "/stages/write",
  "Authorship ledger": "/stages/protect",
  Credits: "/stages/protect",
  "Stage progress": "/pipeline",
  "Spend vs budget": "/stages/finance",
  "Release & revenue": "/stages/release",
  Schedule: "/stages/prep",
  "Call sheets": "/stages/production",
  "Task routing": "/stages/production",
  Bottlenecks: "/stages/production",
  "Overdue approvals": "/guardians",
  "Department tasks": "/stages/prep",
  "Review queue": "/stages/prep",
  "Budget line": "/stages/prep#budget",
  Crew: "/stages/prep",
  "Assigned tasks": "/stages/prep",
  "Call times": "/stages/production",
  References: "/stages/develop",
  "Submission history": "/brain",
  "Deliverables to review": "/stages/post",
  "Delivery specs": "/stages/post",
  "QC reports": "/stages/post",
};

export function Home() {
  const { role } = useBrain();
  return role === "producer" ? <CommandCentre /> : <RoleHome role={role} />;
}

/* ------------------------------------------------------------------ */

function Masthead({ aside }: { aside: React.ReactNode }) {
  const facts = [
    ["Format", "Tamil feature, Hindi dub"],
    ["Script", `${PROJECT.scenes} scenes, locked`],
    ["Shoot", `${PROJECT.shootDays} days, Kumbakonam`],
    ["Budget", `₹${PROJECT.budgetCr} Cr baseline`],
  ];
  return (
    <section className="grid items-end gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <h1 className="display text-[56px] text-[var(--ink)] md:text-[80px]">
          {PROJECT.title}
        </h1>
        <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">{PROJECT.logline}</p>
        <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-[12.5px] muted">{k}</dt>
              <dd className="text-[14px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      {aside}
    </section>
  );
}

function NextGate() {
  const { activeStage, checks } = useBrain();
  const active = STAGES.find((s) => s.id === activeStage);
  if (!active) return <div className="card">Every gate is signed. {PROJECT.title} is out in the world.</div>;
  const done = active.gate.items.filter((i) => checks[i.id]).length;
  const dated = active.n === PROJECT.nextGate.n;
  return (
    <div className="card flex flex-col gap-3 !border-[var(--haldi)] shadow-[inset_0_4px_0_var(--haldi)]">
      <span className="text-[13px] text-[var(--ink-2)]">Next gate</span>
      <div className="flex items-end justify-between gap-3">
        <span className="title-wide text-[26px] leading-none">{active.gate.name}</span>
        {dated && (
          <span className="flex items-baseline gap-1">
            <span className="display text-[44px] text-[var(--ink)]">{PROJECT.nextGate.days}</span>
            <span className="text-[13px] muted">days</span>
          </span>
        )}
      </div>
      <span className="text-[13px] muted">{dated ? `Review on ${PROJECT.nextGate.on}` : "Review date not set yet"}</span>
      <Meter value={(done / active.gate.items.length) * 100} color="var(--ink)" label="Gate checklist" />
      <div className="flex items-center justify-between text-[13px]">
        <span>
          {done} of {active.gate.items.length} items ready
        </span>
        <Link href={`/stages/${active.id}#gate`} className="font-semibold text-[var(--brand)] hover:underline">
          Open checklist
        </Link>
      </div>
    </div>
  );
}

function NeedsYou({ role }: { role: RoleId }) {
  const { approvals, decide, flags, resolveFlag } = useBrain();
  const mineApprovals = APPROVALS.filter((a) => a.roles.includes(role));
  const pending = mineApprovals.filter((a) => !approvals[a.id]).length;
  const myFlags = FLAGS.filter((f) => f.owner === role && !flags[f.id]).sort((a, b) => (a.severity === "high" ? -1 : b.severity === "high" ? 1 : 0));
  return (
    <Panel
      title="Needs you today"
      kicker={pending + myFlags.length ? `${pending} sign-offs and ${myFlags.length} flags are waiting on you.` : "You're clear. Agents will add anything new here."}
      right={pending + myFlags.length ? <Chip tone="warn">{pending + myFlags.length} open</Chip> : <Chip tone="ok">All clear</Chip>}
    >
      {mineApprovals.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold text-[var(--muted)]">Sign-offs</h3>
          <ApprovalRows list={mineApprovals} approvals={approvals} decide={decide} />
        </div>
      )}
      {myFlags.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[var(--rule-2)] pt-4">
          <h3 className="text-[13px] font-semibold text-[var(--muted)]">Flags you own</h3>
          <FlagRows list={myFlags} role={role} resolveFlag={resolveFlag} />
        </div>
      )}
    </Panel>
  );
}

function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="title-wide text-[22px] leading-tight">{title}</h2>
        {sub && <p className="text-[13.5px] muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CommandCentre() {
  const { activeStage } = useBrain();
  const active = STAGES.find((s) => s.id === activeStage);
  const committed = FUNDERS.filter((f) => f.lane === "committed").reduce((s, f) => s + f.amtCr, 0);
  const agentSpent = STAGES.flatMap((s) => s.agents).reduce((s, a) => s + a.spentK, 0);
  const agentBudget = STAGES.flatMap((s) => s.agents).reduce((s, a) => s + a.budgetK, 0);

  return (
    <>
      <Masthead aside={<NextGate />} />

      <section className="flex flex-col gap-3">
        <SectionTitle title="Production timeline" sub="Nine stages from first idea to release. Click a stage to open it." />
        <Timeline />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <NeedsYou role="producer" />
        <div className="flex flex-col gap-6">
          <Panel title="Money" kicker="Budget, funding and what the agents cost.">
            <div className="flex flex-col gap-4 text-[13.5px]">
              <Row k="Spent so far" v={`₹4.5 Cr of ₹${PROJECT.budgetCr} Cr`} pct={31} c="var(--ink)" />
              <Row k="Funding committed" v={`₹${committed.toFixed(1)} Cr`} pct={(committed / PROJECT.budgetCr) * 100} c="var(--ok)" />
              <Row k="Pre-production spend against plan" v="97%" pct={97} c="var(--c1)" />
              <Row k="Agent model spend" v={`₹${agentSpent}k of ₹${agentBudget}k`} pct={(agentSpent / agentBudget) * 100} c="var(--ai)" />
            </div>
          </Panel>
          <FeedPanel stage={active?.id} limit={3} />
        </div>
      </div>

    </>
  );
}

function Row({ k, v, pct, c }: { k: string; v: string; pct: number; c: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex justify-between gap-3">
        {k} <span className="mono font-semibold">{v}</span>
      </span>
      <Meter value={pct} color={c} label={k} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RoleHome({ role }: { role: RoleId }) {
  const r = roleById(role);
  const { activeStage } = useBrain();
  const active = STAGES.find((s) => s.id === activeStage);
  const visibleActive = active && r.stages.includes(active.id) ? active : undefined;
  const firstName = r.person.split(/[ (]/)[0];

  return (
    <>
      <section className="flex flex-col gap-4">
        <p className="text-[14px] text-[var(--ink-2)]">
          {firstName}, {r.label} on {PROJECT.title}
        </p>
        <h1 className="display text-[44px] md:text-[64px]">
          {r.home}
        </h1>
        <p className="max-w-[62ch] text-[15px] text-[var(--ink-2)]">
          You see {r.stages.length === 9 ? "every stage" : `${r.stages.length} of the 9 stages`}, plus the sign-offs and flags meant for you. You can{" "}
          {r.actions.map((a, i) => (
            <span key={a}>
              {i > 0 && (i === r.actions.length - 1 ? " and " : ", ")}
              {a.toLowerCase()}
            </span>
          ))}
          .
        </p>
      </section>

      <Timeline />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <NeedsYou role={role} />
        <Panel title="Your screens" kicker="The parts of the project you work in.">
          <ul className="flex flex-col">
            {r.panels.map((p) => (
              <li key={p} className="border-t border-[var(--rule)] first:border-0">
                <Link href={PANEL_HOME[p] ?? `/stages/${r.stages[0]}`} className="flex items-center justify-between gap-2 py-2.5 text-[14px] font-medium hover:text-[var(--brand)]">
                  {p}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      {visibleActive && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
          <FeedPanel stage={visibleActive.id} limit={4} />
          <GatePanel stage={visibleActive} />
        </div>
      )}
    </>
  );
}
