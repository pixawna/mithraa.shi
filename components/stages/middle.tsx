"use client";

import { useMemo, useState } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { AiTag, Chip, Meter, Panel, type Tone } from "@/components/ui";
import {
  BUDGET_DEPTS,
  CASTING,
  FUNDERS,
  INCENTIVES,
  LOCATIONS,
  PITCH_ANALYTICS,
  PROJECT,
  READINESS,
  STRIPS,
  type FundLane,
  type Strip,
} from "@/lib/data";

/* ================================================================== */
/* Stage 5 · Deal Room                                                 */
/* ================================================================== */

const FUND_LANES: { id: FundLane; label: string }[] = [
  { id: "contacted", label: "Contacted" },
  { id: "reviewing", label: "Reviewing" },
  { id: "negotiating", label: "Negotiating" },
  { id: "committed", label: "Committed" },
];

const STACK_COLOURS: Record<string, string> = {
  Equity: "var(--c1)",
  "State incentive": "var(--c3)",
  "Pre-sale": "var(--c2)",
  Gap: "var(--c4)",
};

export function DealRoom() {
  const { log } = useBrain();
  const [funders, setFunders] = useState(FUNDERS);
  const [over, setOver] = useState<FundLane | null>(null);
  const [gross, setGross] = useState(32); // ₹ Cr box office + rights

  const committed = funders.filter((f) => f.lane === "committed");
  const byKind = committed.reduce<Record<string, number>>((m, f) => ((m[f.kind] = (m[f.kind] ?? 0) + f.amtCr), m), {});
  const committedTotal = committed.reduce((s, f) => s + f.amtCr, 0);
  const gap = Math.max(0, PROJECT.budgetCr - committedTotal);

  // Recoupment waterfall: distribution fee → P&A → investor recoup + 20% premium → profit split 50/50
  const wf = useMemo(() => {
    const dist = gross * 0.25;
    const pa = Math.min(3.2, gross - dist);
    const recoup = Math.min(PROJECT.budgetCr * 1.2, gross - dist - pa);
    const profit = Math.max(0, gross - dist - pa - recoup);
    return [
      { k: "Distributor fee (25%)", v: dist },
      { k: "P&A recovery", v: pa },
      { k: "Investors recoup + 20%", v: recoup },
      { k: "Profit share, investors (50%)", v: profit / 2 },
      { k: "Profit share, producer and talent (50%)", v: profit / 2 },
    ];
  }, [gross]);

  const move = (id: string, lane: FundLane) => {
    const f = funders.find((x) => x.id === id);
    if (!f || f.lane === lane) return;
    setFunders((xs) => xs.map((x) => (x.id === id ? { ...x, lane } : x)));
    log("moved funder", `${f.name} to ${lane}`);
  };

  return (
    <>
      <Panel title="Funding pipeline" kicker="The Funding Match agent finds and ranks investors. You move them along.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FUND_LANES.map((l) => (
            <div
              key={l.id}
              className={`lane ${over === l.id ? "lane-over" : ""}`}
              onDragOver={(e) => (e.preventDefault(), setOver(l.id))}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => (move(e.dataTransfer.getData("text/plain"), l.id), setOver(null))}
            >
              <span className="px-1 text-[13px] font-semibold">{l.label}</span>
              {funders
                .filter((f) => f.lane === l.id)
                .map((f) => (
                  <div key={f.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", f.id)} className="tile draggable flex flex-col gap-1">
                    <span className="text-[13.5px] font-semibold">{f.name}</span>
                    <span className="flex items-center justify-between text-[12px] muted">
                      {f.kind} <span className="mono text-[var(--ink-2)]">₹{f.amtCr} Cr</span>
                    </span>
                    <select
                      aria-label={`Move ${f.name}`}
                      value={f.lane}
                      onChange={(e) => move(f.id, e.target.value as FundLane)}
                      className="rounded-md border border-[var(--line)] bg-[var(--bg-2)] px-1.5 py-0.5 text-[12.5px] muted"
                    >
                      {FUND_LANES.map((x) => (
                        <option key={x.id} value={x.id}>
                          Move to {x.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Capital stack vs approved budget"
          kicker={`Against the ₹${PROJECT.budgetCr} Cr baseline, locked at Gate 5.`}
          right={<Chip tone={gap > 0 ? "warn" : "ok"}>{gap > 0 ? `Gap ₹${gap.toFixed(1)} Cr` : "Fully funded"}</Chip>}
        >
          <div className="flex h-9 gap-[2px] overflow-hidden rounded-lg" role="img" aria-label="Capital stack by source">
            {Object.entries(byKind).map(([k, v]) => (
              <div key={k} className="flex items-center justify-center text-[12px] font-semibold text-black" style={{ width: `${(v / Math.max(PROJECT.budgetCr, committedTotal)) * 100}%`, background: STACK_COLOURS[k] ?? "var(--c4)" }} title={`${k}: ₹${v.toFixed(1)} Cr`}>
                {((v / PROJECT.budgetCr) * 100).toFixed(0)}%
              </div>
            ))}
            {gap > 0 && (
              <div className="flex items-center justify-center text-[12px] muted" style={{ width: `${(gap / PROJECT.budgetCr) * 100}%`, background: "repeating-linear-gradient(45deg,#16161a 0 5px,#222228 5px 10px)" }} title={`Gap: ₹${gap.toFixed(1)} Cr`}>
                gap
              </div>
            )}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px]">
            {Object.entries(byKind).map(([k, v]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STACK_COLOURS[k] ?? "var(--c4)" }} />
                {k} <span className="mono muted">₹{v.toFixed(1)} Cr</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] muted">Drag a funder into Committed to see the stack update.</p>
        </Panel>

        <Panel title="Who gets paid back first" kicker="The recoupment waterfall from the signed term sheet. Drag to try a different result." right={<AiTag />}>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="flex justify-between">
              If the film earns <b className="mono">₹{gross} Cr</b>
            </span>
            <input type="range" min={8} max={80} value={gross} onChange={(e) => setGross(+e.target.value)} className="accent-[var(--accent)]" />
          </label>
          <ol className="flex flex-col gap-2">
            {wf.map((w, i) => (
              <li key={w.k} className="grid grid-cols-[20px_1fr_70px] items-center gap-2 text-[12.5px]">
                <span className="mono muted">{i + 1}</span>
                <span className="flex flex-col gap-1">
                  {w.k}
                  <Meter value={(w.v / gross) * 100} color={i < 2 ? "var(--faint)" : i === 2 ? "var(--c1)" : "var(--ok)"} label={w.k} />
                </span>
                <span className="mono text-right">₹{w.v.toFixed(1)}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] muted">
            Investors are {wf[2].v >= PROJECT.budgetCr * 1.2 - 0.01 ? "fully recouped with premium" : `${((wf[2].v / (PROJECT.budgetCr * 1.2)) * 100).toFixed(0)}% recouped`} in this scenario.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Pitch analytics" kicker="Who opened the pitch kit">
          <table className="tbl">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Opens</th>
                <th>Time</th>
                <th>Most read</th>
              </tr>
            </thead>
            <tbody>
              {PITCH_ANALYTICS.map((p) => (
                <tr key={p.who}>
                  <td className="!text-[var(--ink)]">{p.who}</td>
                  <td className="mono">{p.opens}</td>
                  <td className="mono">{p.mins}m</td>
                  <td>{p.top}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Incentives finder" kicker="State, country and fund incentives">
          <ul className="flex flex-col gap-2">
            {INCENTIVES.map((i) => (
              <li key={i.k} className="tile flex items-center justify-between gap-3">
                <span className="flex flex-col">
                  <span className="text-[13px]">{i.k}</span>
                  <span className="mono text-[12.5px] muted">{i.v}</span>
                </span>
                <Chip tone={i.state as Tone}>{i.deadline === "Claimed" ? "Claimed" : `Due ${i.deadline}`}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ================================================================== */
/* Stage 6 · Prep Control                                              */
/* ================================================================== */

const KIND: Record<Strip["kind"], { label: string; bg: string; fg: string }> = {
  "int-day": { label: "Interior day", bg: "#ffffff", fg: "#141b3a" },
  "ext-day": { label: "Exterior day", bg: "#f9e27d", fg: "#3d3000" },
  night: { label: "Exterior night", bg: "#bfe3c4", fg: "#103a1d" },
};

export function PrepControl() {
  const { log, role, decide, approvals } = useBrain();
  const [days, setDays] = useState(STRIPS);
  const [drag, setDrag] = useState<string | null>(null);
  const [overDay, setOverDay] = useState<string | null>(null);
  const [loc, setLoc] = useState(LOCATIONS[1].id);
  const [stamps, setStamps] = useState<Record<string, boolean>>({ "12-1": true, "12-2": true });
  const [pick, setPick] = useState<Record<string, string>>({});

  const dayStats = (list: Strip[]) => ({
    cost: list.reduce((s, x) => s + x.costL, 0),
    cast: new Set(list.flatMap((x) => x.cast)).size,
    moves: new Set(list.map((x) => x.set)).size - 1,
    night: list.some((x) => x.kind === "night") && list.some((x) => x.kind !== "night"),
  });

  const moveStrip = (stripId: string, to: string) => {
    let moved: Strip | undefined;
    const next: typeof days = {};
    for (const [d, list] of Object.entries(days)) {
      next[d] = list.filter((s) => (s.id === stripId ? ((moved = s), false) : true));
    }
    if (!moved) return;
    next[to] = [...next[to], moved];
    setDays(next);
    log("rescheduled", `Sc ${moved.sc} to ${to}`);
  };

  const sel = LOCATIONS.find((l) => l.id === loc)!;
  const canDirect = role === "director" || role === "producer";

  const boards = [
    { id: "12-1", cap: "Wide, dawn courtyard", d: "M0 70H160M44 70V44l22-16 22 16v26M128 30a10 10 0 1 0 0 .1" },
    { id: "12-2", cap: "Mid, Paati drawing", d: "M60 90c2-22 8-32 20-32s18 10 20 32M80 50a9 9 0 1 0 0 .1M30 86h100" },
    { id: "18-2", cap: "Close, Nila's hands", d: "M30 90c6-18 14-24 24-24M130 90c-6-18-14-24-24-24M60 40h40M66 48h28", flag: true },
    { id: "19-1", cap: "Two-shot, sisters", d: "M20 66H140M52 34a8 8 0 1 0 0 .1M38 66c2-14 7-22 14-22s12 8 14 22M108 32a8 8 0 1 0 0 .1M94 66c2-14 7-22 14-22s12 8 14 22", flag: true },
    { id: "26-1", cap: "Turnaround, Paati", d: "M40 90V40a10 10 0 0 1 20 0v50M80 90V40a10 10 0 0 1 20 0v50M120 90V40a10 10 0 0 1 20 0v50" },
    { id: "26-2", cap: "Concept, temple street", d: "M0 90L70 50H90L160 90M80 52v8M80 66v8M36 70V24h10" },
  ];

  return (
    <>
      <Panel title="Readiness meter" kicker="Percent ready per department and per shoot day">
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          {READINESS.map((r) => (
            <div key={r.k} className="flex flex-col gap-1.5">
              <span className="flex justify-between text-[13px]">
                {r.k}
                <span className="mono" style={{ color: r.v >= 90 ? "var(--ok)" : r.v < 70 ? "var(--warn)" : "var(--ink)" }}>
                  {r.v}%
                </span>
              </span>
              <Meter value={r.v} label={`${r.k} readiness`} color={r.v >= 90 ? "var(--ok)" : "var(--accent)"} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Each of the 38 shoot days</span>
          <div className="grid grid-cols-[repeat(19,minmax(0,1fr))] gap-1 md:grid-cols-[repeat(38,minmax(0,1fr))]">
            {Array.from({ length: 38 }).map((_, i) => {
              const v = Math.max(20, 100 - i * 2.1 - (i % 5 === 3 ? 18 : 0));
              return (
                <span key={i} title={`Day ${i + 1}: ${Math.round(v)}% ready`} className="h-6 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--brand) ${v}%, #1a1a1f)` }} />
              );
            })}
          </div>
          <span className="flex justify-between text-[12px] muted">
            <span>Day 1</span>
            <span>Lighter = less ready</span>
            <span>Day 38</span>
          </span>
        </div>
      </Panel>

      <Panel
        title="Stripboard, first five shoot days"
        kicker="Version 4 from the Scheduling agent. Drag a strip to another day; cost and cast update as you go."
        right={
          <span className="flex flex-wrap gap-1.5">
            {Object.values(KIND).map((k) => (
              <span key={k.label} className="tag" style={{ background: k.bg, color: k.fg, borderColor: "rgba(20,27,58,0.18)" }}>
                {k.label}
              </span>
            ))}
          </span>
        }
      >
        <div className="flex flex-col gap-2">
          {Object.entries(days).map(([d, list]) => {
            const st = dayStats(list);
            return (
              <div
                key={d}
                onDragOver={(e) => (e.preventDefault(), setOverDay(d))}
                onDragLeave={() => setOverDay(null)}
                onDrop={() => (drag && moveStrip(drag, d), setDrag(null), setOverDay(null))}
                className={`grid items-center gap-3 rounded-md border p-2 md:grid-cols-[70px_1fr_220px] ${overDay === d ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--rule)] bg-[var(--sheet-2)]"}`}
              >
                <span className="mono text-[12px] font-semibold">{d}</span>
                <div className="flex min-h-[42px] flex-wrap gap-1.5">
                  {list.map((s) => (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={() => setDrag(s.id)}
                      className="draggable flex min-w-[150px] flex-col rounded-[3px] border border-[rgba(20,27,58,0.18)] px-2.5 py-1.5 text-[12.5px]"
                      style={{ background: KIND[s.kind].bg, color: KIND[s.kind].fg }}
                      title={`${s.cast.join(", ")}, ₹${s.costL}L`}
                    >
                      <b>
                        Sc {s.sc}, {s.set}
                      </b>
                      <span className="opacity-75">{s.cast.join(", ")}</span>
                    </div>
                  ))}
                  {list.length === 0 && <span className="self-center text-[12px] muted">Drop a strip here</span>}
                </div>
                <div className="mono flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] muted md:justify-end">
                  <span>₹{st.cost.toFixed(1)}L</span>
                  <span>{st.cast} cast</span>
                  <span style={{ color: st.moves > 1 ? "var(--warn)" : undefined }}>{Math.max(0, st.moves)} moves</span>
                  {st.night && <span style={{ color: "var(--risk)" }}>day into night</span>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[12px] muted">Cost and cast impact update live. The Compliance Guardian re-checks crew hours after every move.</p>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel id="boards" title="Boards and look" kicker="Drawn by the Storyboard and Visual Dev agents. The director stamps what's approved." right={<AiTag />}>
          <div className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
            {boards.map((b) => (
              <figure key={b.id} className="flex flex-col gap-1.5">
                <div className="relative overflow-hidden rounded-[3px] border border-[var(--rule-2)] bg-white">
                  <svg viewBox="0 0 160 90" className="block w-full" fill="none" stroke="#141b3a" strokeWidth="1.1" aria-label={b.cap} role="img">
                    <path d={b.d} />
                  </svg>
                  {stamps[b.id] && (
                    <span className="absolute top-2 right-2 rotate-[-8deg] rounded border-2 border-[var(--ok)] px-1.5 text-[12px] font-bold text-[var(--ok)]">
                      APPROVED
                    </span>
                  )}
                  {b.flag && !stamps[b.id] && <span className="absolute top-2 left-2"><Chip tone="risk">Continuity</Chip></span>}
                </div>
                <figcaption className="flex items-center justify-between gap-2 text-[12px]">
                  <span>
                    <b className="mono">{b.id}</b> <span className="muted">{b.cap}</span>
                  </span>
                  <button
                    className="btn btn-sm btn-ghost !min-h-[24px] !px-2"
                    disabled={!canDirect}
                    title={canDirect ? undefined : "Only the director or producer can stamp"}
                    onClick={() => (setStamps((s) => ({ ...s, [b.id]: !s[b.id] })), log(stamps[b.id] ? "removed stamp" : "approved board", b.id))}
                  >
                    {stamps[b.id] ? "Unstamp" : "Stamp"}
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </Panel>

        <Panel id="budget" title="Budget against baseline" kicker="Each department's estimate in ₹ Cr, against the baseline locked at Gate 5.">
          <ul className="flex flex-col gap-3">
            {BUDGET_DEPTS.map((d) => {
              const over = (d.est / d.base - 1) * 100;
              const max = Math.max(...BUDGET_DEPTS.map((x) => Math.max(x.base, x.est)));
              return (
                <li key={d.k} className="flex flex-col gap-1 text-[12.5px]">
                  <span className="flex justify-between">
                    {d.k}
                    <span className="mono" style={{ color: over > 2 ? "var(--risk)" : over < -2 ? "var(--ok)" : "var(--muted)" }}>
                      {d.est.toFixed(2)} {over > 0.5 ? `+${over.toFixed(0)}%` : over < -0.5 ? `${over.toFixed(0)}%` : "on plan"}
                    </span>
                  </span>
                  <span className="relative block h-2 rounded-full bg-white/[0.08]">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(d.est / max) * 100}%`, background: over > 2 ? "var(--risk)" : "var(--ink-2)" }} />
                    <span className="absolute -top-1 -bottom-1 w-[2px] bg-[var(--ink)]" style={{ left: `${(d.base / max) * 100}%` }} title={`Baseline ${d.base}`} />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-[12.5px] muted">The bar is the current estimate; the white tick is the baseline.</p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel id="casting" title="Casting" kicker="Shortlists and look-tests from the Casting agent. Look-tests need the actor's recorded consent.">
          <div className="overflow-x-auto thin-scroll">
            <table className="tbl min-w-[520px]">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Shortlist and look match</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {CASTING.map((c) => {
                  const cast = c.actors.find((a) => a.state === "Cast");
                  const chosen = pick[c.role];
                  return (
                    <tr key={c.role}>
                      <td className="!text-[var(--ink)] font-semibold">{c.role}</td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {c.actors.map((a) => (
                            <button
                              key={a.n}
                              disabled={!!cast || !canDirect}
                              onClick={() => {
                                setPick((p) => ({ ...p, [c.role]: a.n }));
                                log("picked actor", `${c.role}: ${a.n}`);
                                if (c.role === "Nila" && !approvals.ap1) decide("ap1", "Cast Nila from 3 look-tests", "approved");
                              }}
                              className={`chip chip-plain border ${cast || chosen === a.n ? "chip-ok" : "chip-idle"} ${!cast && canDirect ? "cursor-pointer hover:border-[var(--accent)]" : ""}`}
                              style={{ borderColor: chosen === a.n ? "var(--ok)" : "var(--line)" }}
                            >
                              {a.n} <span className="mono opacity-75">{a.look}</span>
                            </button>
                          ))}
                          {!cast && !chosen && <Chip tone="warn">Needs pick</Chip>}
                        </div>
                      </td>
                      <td className="mono text-[12.5px]">{c.avail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="locations" title="Locations" kicker="Recce and permit status from the Location agent.">
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <svg viewBox="0 0 100 100" className="w-full rounded-md border border-[var(--rule)] bg-[#0d0e11]" role="img" aria-label="Map of Kumbakonam locations">
              <path d="M-5 84 C 20 76, 40 92, 60 82 S 90 70, 105 76" stroke="#14324a" strokeWidth="7" fill="none" />
              <text x="8" y="94" fontSize="3" fill="#6fa3c8">Cauvery</text>
              {[20, 40, 60, 80].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100" stroke="#18191d" />
                  <line x1="0" y1={v} x2="100" y2={v} stroke="#18191d" />
                </g>
              ))}
              <path d="M10 10 L 90 60" stroke="#2a2a31" strokeWidth="2.5" />
              <path d="M5 40 L 95 35" stroke="#2a2a31" strokeWidth="2.5" />
              {LOCATIONS.map((l) => {
                const ok = l.permit === "Granted" || l.permit === "Not needed";
                return (
                  <g key={l.id} onClick={() => setLoc(l.id)} className="cursor-pointer">
                    <circle cx={l.x} cy={l.y} r={loc === l.id ? 4.5 : 3.2} fill={ok ? "var(--ok)" : "var(--haldi)"} stroke="#060607" strokeWidth="1.2" />
                    <title>{`${l.name}: ${l.permit}`}</title>
                    {loc === l.id && <circle cx={l.x} cy={l.y} r="7" fill="none" stroke="var(--accent)" strokeWidth="0.6" />}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-col gap-2">
              <div className="tile flex flex-col gap-1">
                <span className="text-[14px] font-semibold">{sel.name}</span>
                <span className="text-[12.5px] muted">{sel.scenes} scenes</span>
                <span className="flex flex-wrap gap-1.5 pt-1">
                  <Chip tone={sel.recce === "Locked" ? "ok" : "info"}>{sel.recce}</Chip>
                  <Chip tone={sel.permit.startsWith("Pending") ? "warn" : "ok"}>Permit: {sel.permit}</Chip>
                </span>
              </div>
              <ul className="flex flex-col gap-0.5">
                {LOCATIONS.map((l) => (
                  <li key={l.id}>
                    <button onClick={() => setLoc(l.id)} className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[12.5px] ${loc === l.id ? "bg-[var(--raised)]" : "hover:bg-[var(--raised)]"}`}>
                      <span className="truncate">{l.name}</span>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: l.permit.startsWith("Pending") ? "var(--haldi)" : "var(--ok)" }} />
                    </button>
                  </li>
                ))}
              </ul>
              <span className="text-[12.5px] muted">Green: permit granted. Amber: still pending.</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
