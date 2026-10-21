"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { AiTag, Avatar, Chip, Meter, Panel, type Tone } from "@/components/ui";
import { Still } from "@/components/media/Still";
import {
  BEATS,
  CHARACTERS,
  CONTRACTS,
  COVERAGE,
  CREDITS,
  DRAFTS,
  IDEAS,
  IP_LEADS,
  LEDGER,
  MARKET,
  NOTES,
  REGISTRATIONS,
  RELATIONS,
  SHARE_LOG,
  TABLE_READ,
  VERSION_LADDER,
  type Idea,
  type IdeaLane,
} from "@/lib/data";

/* ================================================================== */
/* Stage 1 · Idea Studio                                               */
/* ================================================================== */

const LANES: { id: IdeaLane; label: string }[] = [
  { id: "raw", label: "Raw" },
  { id: "exploring", label: "Exploring" },
  { id: "developing", label: "Developing" },
  { id: "parked", label: "Parked" },
];

const total = (i: Idea) => Math.round((i.scores.originality + i.scores.audience + i.scores.budget + i.scores.franchise) / 4);

export function IdeaStudio() {
  const { log } = useBrain();
  const [ideas, setIdeas] = useState(IDEAS);
  const [sel, setSel] = useState("kolam");
  const [over, setOver] = useState<IdeaLane | null>(null);
  const selected = ideas.find((i) => i.id === sel)!;

  const move = (id: string, lane: IdeaLane) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea || idea.lane === lane) return;
    setIdeas((xs) => xs.map((i) => (i.id === id ? { ...i, lane } : i)));
    log("moved idea", `${idea.title} to ${LANES.find((l) => l.id === lane)!.label}`);
  };

  return (
    <>
      <Panel title="Idea board" kicker="Drag a card between columns. Agents score ideas; a person always picks which go forward.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {LANES.map((l) => {
            const list = ideas.filter((i) => i.lane === l.id);
            return (
              <div
                key={l.id}
                className={`lane ${over === l.id ? "lane-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(l.id);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  move(e.dataTransfer.getData("text/plain"), l.id);
                  setOver(null);
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-[13px] font-semibold">{l.label}</span>
                  <span className="mono text-[12px] muted">{list.length}</span>
                </div>
                {list.map((i) => (
                  <button
                    key={i.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", i.id)}
                    onClick={() => setSel(i.id)}
                    className={`tile draggable flex flex-col gap-1.5 text-left ${sel === i.id ? "!border-[var(--accent)]" : ""}`}
                  >
                    <span className="text-[13.5px] font-semibold">{i.title}</span>
                    <span className="text-[12.5px] leading-snug muted">{i.line}</span>
                    <span className="flex items-center justify-between">
                      <Chip tone={total(i) >= 80 ? "ok" : total(i) >= 65 ? "info" : "idle"} plain>
                        Score {total(i)}
                      </Chip>
                      <span className="mono text-[12px] muted">{i.source}</span>
                    </span>
                    <select
                      aria-label={`Move ${i.title}`}
                      value={i.lane}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => move(i.id, e.target.value as IdeaLane)}
                      className="rounded-md border border-[var(--line)] bg-[var(--bg-2)] px-1.5 py-0.5 text-[12.5px] muted"
                    >
                      {LANES.map((x) => (
                        <option key={x.id} value={x.id}>
                          Move to {x.label}
                        </option>
                      ))}
                    </select>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={`How ${selected.title} scores`} kicker="From the Premise Scorer, with its reasons." right={<AiTag />}>
          <Radar idea={selected} />
          <p className="text-[12.5px] muted">
            Scores explain themselves: tap a card above to compare ideas. The Premise Scorer never moves an idea between columns.
          </p>
        </Panel>
        <div className="flex flex-col gap-5">
          <Panel title="Market pulse" kicker="What audiences are watching, from the Trend & Market Scout.">
            <ul className="flex flex-col gap-3">
              {MARKET.map((m) => (
                <li key={m.k} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px]">
                  <span>{m.k}</span>
                  <span className="mono text-[12px]" style={{ color: m.trend.startsWith("−") ? "var(--warn)" : "var(--ok)" }}>
                    {m.trend}
                  </span>
                  <span className="col-span-2">
                    <Meter value={m.v} label={m.k} color="var(--ink-2)" />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Stories you could adapt" kicker="Found by the IP Scout, with rights status.">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rights</th>
                </tr>
              </thead>
              <tbody>
                {IP_LEADS.map((l) => (
                  <tr key={l.title}>
                    <td>
                      <div className="text-[var(--ink)]">{l.title}</div>
                      <div className="text-[12.5px] muted">{l.kind}</div>
                    </td>
                    <td>
                      <Chip tone={l.status as Tone}>{l.rights}</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Radar({ idea }: { idea: Idea }) {
  const axes = [
    ["Originality", idea.scores.originality],
    ["Audience fit", idea.scores.audience],
    ["Budget band", idea.scores.budget],
    ["Franchise", idea.scores.franchise],
  ] as const;
  const c = 130;
  const R = 92;
  const pt = (i: number, v: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
    return [c + Math.cos(ang) * R * (v / 100), c + Math.sin(ang) * R * (v / 100)] as const;
  };
  const poly = axes.map(([, v], i) => pt(i, v).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`Scores for ${idea.title}: ${axes.map(([k, v]) => `${k} ${v}`).join(", ")}`}>
      {[25, 50, 75, 100].map((r) => (
        <polygon key={r} points={axes.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="#2a2a31" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#2a2a31" />;
      })}
      <polygon points={poly} fill="rgba(43,54,201,0.12)" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />
      {axes.map(([k, v], i) => {
        const [x, y] = pt(i, v);
        const [lx, ly] = pt(i, 122);
        return (
          <g key={k}>
            <circle cx={x} cy={y} r="4.5" fill="var(--brand)" stroke="#fff" strokeWidth="2">
              <title>{`${k}: ${v}`}</title>
            </circle>
            <text x={lx} y={ly} fill="#8a8a94" fontSize="10.5" textAnchor="middle" dominantBaseline="middle">
              {k}
            </text>
            <text x={lx} y={ly + 13} fill="#f4f4f2" fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ================================================================== */
/* Stage 2 · Story Room                                                */
/* ================================================================== */

export function StoryRoom() {
  const { log } = useBrain();
  const [first, setFirst] = useState(BEATS.first);
  const [second, setSecond] = useState(BEATS.second);
  const [tab, setTab] = useState<"World" | "Characters" | "Locations" | "Timeline">("World");
  const [hover, setHover] = useState<string | null>(null);

  const shift = (half: "first" | "second", i: number, d: -1 | 1) => {
    const [list, set] = half === "first" ? [first, setFirst] : [second, setSecond];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
    log("reordered beat", next[j].t);
  };

  const half = (which: "first" | "second", list: typeof first) => (
    <div className="lane flex-1 !border-solid" style={{ minWidth: 240 }}>
      <span className="px-1 text-[13px] font-semibold">{which === "first" ? "First half" : "Second half"}</span>
      {list.map((b, i) => (
        <div key={b.t} className="tile flex items-center gap-2">
          <span className="mono w-14 shrink-0 text-[12px] muted">sc {b.sc}</span>
          <span className="flex-1 text-[13px]">{b.t}</span>
          <span className="flex flex-col">
            <button className="px-1 text-[12px] muted hover:text-[var(--ink)]" aria-label="Move up" onClick={() => shift(which, i, -1)}>
              ▲
            </button>
            <button className="px-1 text-[12px] muted hover:text-[var(--ink)]" aria-label="Move down" onClick={() => shift(which, i, 1)}>
              ▼
            </button>
          </span>
        </div>
      ))}
    </div>
  );

  const pos = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

  return (
    <>
      <Panel title="Beat board" kicker="Laid out in two halves around the interval. Use the arrows to reorder beats.">
        <div className="flex flex-wrap items-stretch gap-3">
          {half("first", first)}
          <div className="flex min-w-[150px] flex-col items-center justify-center gap-1 rounded-md border-2 border-[var(--ink)] bg-[var(--haldi-soft)] px-4 py-3 text-center">
            <span className="title-wide text-[15px]">Interval</span>
            <span className="text-[12.5px] muted">Scene {BEATS.interval.sc}</span>
            <span className="text-[13px] font-semibold">{BEATS.interval.t}</span>
          </div>
          {half("second", second)}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Character web" kicker="Who is tied to whom, and how much of each arc is written.">
          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
            <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label="Relationship map of six characters">
              {RELATIONS.map(([a, b, label]) => {
                const A = pos[a];
                const B = pos[b];
                const on = hover === a || hover === b;
                return (
                  <g key={a + b}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={on ? "var(--brand)" : "#3a3a42"} strokeWidth={on ? 0.7 : 0.4} strokeDasharray={label === "estranged" || label === "rivals" ? "1.5 1" : undefined} />
                    {on && (
                      <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 1} fontSize="2.8" fill="#d4ff3a" textAnchor="middle">
                        {label}
                      </text>
                    )}
                  </g>
                );
              })}
              {CHARACTERS.map((c) => (
                <g key={c.id} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
                  <circle cx={c.x} cy={c.y} r="6.5" fill="#18181d" stroke={hover === c.id ? "var(--brand)" : "#55555f"} strokeWidth="0.6" />
                  <circle cx={c.x} cy={c.y} r="6.5" fill="none" stroke="var(--ok)" strokeWidth="0.9" strokeDasharray={`${(c.arc / 100) * 40.8} 40.8`} transform={`rotate(-90 ${c.x} ${c.y})`} />
                  <text x={c.x} y={c.y + 1} fontSize="3.2" fill="#f4f4f2" textAnchor="middle" fontWeight="600">
                    {c.name}
                  </text>
                </g>
              ))}
            </svg>
            <ul className="flex flex-col gap-2.5">
              {CHARACTERS.map((c) => (
                <li key={c.id} className="flex flex-col gap-1" onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
                  <span className="flex justify-between text-[12.5px]">
                    <span>
                      <b className="font-semibold">{c.name}</b> <span className="muted">{c.role}</span>
                    </span>
                    <span className="mono muted">{c.arc}%</span>
                  </span>
                  <Meter value={c.arc} color="var(--ok)" label={`${c.name} arc defined`} />
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[12px] muted">Dashed lines are conflicts. Ring shows how much of each arc is written into the Story Bible.</p>
        </Panel>

        <Panel title="Story Bible" kicker="Linked pages">
          <div role="tablist" className="flex flex-wrap gap-1">
            {(["World", "Characters", "Locations", "Timeline"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={`btn btn-sm ${tab === t ? "!border-[var(--accent)] !text-[var(--accent-ink)]" : "btn-ghost"}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="well flex flex-col gap-2 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            {tab === "World" && (
              <>
                <p>Kumbakonam in Margazhi — the month of dawn kolams. The house sits on the last unsold plot of a street that became a mall car park.</p>
                <p className="muted">Rule: every kolam in the film is drawn in one continuous line. Themes: inheritance, what is drawn vs what is said.</p>
              </>
            )}
            {tab === "Characters" && CHARACTERS.map((c) => <p key={c.id}><b className="text-[var(--ink)]">{c.name}</b>, {c.role.charAt(0).toLowerCase() + c.role.slice(1)}</p>)}
            {tab === "Locations" && ["Paati's house (41 scenes)", "Sarangapani temple street", "Mahamaham tank", "Railway station", "Land records office", "Cauvery ghat"].map((l) => <p key={l}>{l}</p>)}
            {tab === "Timeline" && ["1994: Paati wins the district contest", "2009: Ravi's father sells the side plot", "2016: Nila and Divya stop speaking", "Dec 2026: the last contest"].map((l) => <p key={l} className="mono text-[12.5px]">{l}</p>)}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Version ladder" kicker="Who approved each rung">
          <ol className="relative flex flex-col gap-3 pl-5">
            <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-[var(--line-2)]" />
            {VERSION_LADDER.map((v) => (
              <li key={v.k} className="relative flex items-center justify-between gap-3">
                <span aria-hidden className="absolute -left-5 h-[11px] w-[11px] rounded-full border-2 border-[var(--ok)] bg-[var(--bg)]" />
                <span className="text-[13.5px] font-semibold">{v.k}</span>
                <span className="text-[12px] muted">
                  {v.by}, {v.on}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Research wall" kicker="Reference the Research agent pinned to scenes.">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {[
              ["Pulli kolam grids", "sc 1, 61, 112"],
              ["Margazhi dawn light", "sc 14–19"],
              ["Mahamaham tank, 1994", "sc 33"],
              ["Land record ledgers", "sc 62–78"],
              ["Rice-flour vs chalk", "sc 39"],
              ["Temple car festival", "sc 95"],
            ].map(([t, s], i) => (
              <figure key={t} className="tile !p-2">
                <div className="media mb-1.5 aspect-[3/2] !rounded-md">
                  <Still scene={(["kolam", "dawn-courtyard", "river-ghat", "land-office", "kitchen", "temple-street"] as const)[i]} grain={false} />
                </div>
                <figcaption className="text-[12px] leading-tight">
                  {t}
                  <span className="mono block text-[12px] muted">{s}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ================================================================== */
/* Stage 3 · Writers' Room                                             */
/* ================================================================== */

export function WritersRoom() {
  const { notes, setNote, log } = useBrain();
  const [alt, setAlt] = useState<"pending" | "kept" | "discarded">("pending");
  const [cmpA, setCmpA] = useState(2);
  const [cmpB, setCmpB] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const totalSecs = TABLE_READ.reduce((s, x) => s + x.secs, 0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => (v + 6 >= totalSecs ? (setPlaying(false), totalSecs) : v + 6)), 100);
    return () => clearInterval(id);
  }, [playing, totalSecs]);

  const nowScene = useMemo(() => {
    let acc = 0;
    for (const s of TABLE_READ) {
      if (t < acc + s.secs) return s;
      acc += s.secs;
    }
    return TABLE_READ[TABLE_READ.length - 1];
  }, [t]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Script, draft 5 with pink revision pages"
          kicker="Tamil dialogue, English action. Each writer has their own scenes."
          right={
            <span className="flex items-center gap-1.5">
              <Avatar name="Meenakshi R" size={22} />
              <Avatar name="Joel T" size={22} />
              <Chip tone="info" plain>
                2 writing now
              </Chip>
            </span>
          }
        >
          <div className="flex flex-wrap gap-1.5 text-[12.5px]">
            {["Sc 14, Meenakshi", "Sc 27, Joel", "Sc 44, Meenakshi", "Sc 52, Joel (Hindi)"].map((x) => (
              <Chip key={x} plain>
                {x}
              </Chip>
            ))}
          </div>
          <div className="screenplay">
            <p className="font-bold">44. EXT. PAATI&apos;S HOUSE – TERRACE – NIGHT</p>
            <p className="my-3">Rice-flour dust on both their palms. NILA draws a line; DIVYA finishes it without looking.</p>
            <p className="ml-[38%] font-bold">NILA</p>
            <p className="mx-[20%]">Nee pona appuram, intha veedu pesavae illa.</p>
            <p className="mx-[24%] italic text-[#555]">(After you left, this house stopped talking.)</p>
            <p className="mt-3 ml-[38%] font-bold">DIVYA</p>
            <p className="mx-[20%]">Veedu illa akka. Nee.</p>
            <p className="mx-[24%] italic text-[#555]">(Not the house, akka. You.)</p>
            {alt !== "discarded" && (
              <div className={`mt-4 rounded-md border-l-4 p-3 ${alt === "kept" ? "border-[#1d7b52] bg-[#e0f2e8]" : "border-dashed border-[#6d3bc0] bg-[#f6f1fd]"}`}>
                <p className="mb-1 font-sans text-[12px] font-semibold text-[#6d3bc0]">
                  {alt === "kept" ? "Co-writer alternate, kept by Meenakshi" : "AI draft from the Co-writer. Meenakshi asked for a bridge here."}
                </p>
                <p>Paati&apos;s window light snaps on below. Both sisters freeze, then laugh — the first time in ten years.</p>
              </div>
            )}
          </div>
          {alt === "pending" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] muted">Only the writer decides what stays.</span>
              <button className="btn btn-sm" onClick={() => (setAlt("kept"), log("kept AI alternate", "sc 44 bridge"))}>
                Keep & edit
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => (setAlt("discarded"), log("discarded AI alternate", "sc 44 bridge"))}>
                Discard
              </button>
            </div>
          ) : (
            <span className="text-[12.5px] muted">Alternate {alt}. Logged in the audit trail.</span>
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Coverage scorecard" kicker="Scores across drafts 1 to 5, from the Coverage agent.">
            <ul className="flex flex-col gap-3">
              {COVERAGE.map((c) => {
                const last = c.v[c.v.length - 1];
                const d = last - c.v[c.v.length - 2];
                const pts = c.v.map((v, i) => `${(i / (c.v.length - 1)) * 100},${30 - ((v - 50) / 50) * 28}`).join(" ");
                return (
                  <li key={c.k} className="grid grid-cols-[90px_1fr_70px] items-center gap-3 text-[13px]">
                    <span>{c.k}</span>
                    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full" role="img" aria-label={`${c.k} by draft: ${c.v.join(", ")}`}>
                      <polyline points={pts} fill="none" stroke="var(--brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                      {c.v.map((v, i) => (
                        <circle key={i} cx={(i / (c.v.length - 1)) * 100} cy={30 - ((v - 50) / 50) * 28} r="2" fill="var(--brand)">
                          <title>{`D${i + 1}: ${v}`}</title>
                        </circle>
                      ))}
                    </svg>
                    <span className="mono text-right">
                      {last} <span style={{ color: d >= 0 ? "var(--ok)" : "var(--risk)" }}>{d >= 0 ? `▲${d}` : `▼${-d}`}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Notes inbox" kicker="Agent and human notes">
            <ul className="flex flex-col gap-2">
              {NOTES.map((n) => {
                const s = notes[n.id] ?? n.state;
                return (
                  <li key={n.id} className="tile flex flex-col gap-1.5">
                    <span className="flex items-center justify-between gap-2 text-[12px]">
                      <span className="flex items-center gap-2 font-semibold">
                        {n.from} {n.ai && <AiTag accepted={s === "accepted"} />}
                      </span>
                      <Chip tone={s === "accepted" ? "ok" : s === "rejected" ? "idle" : "warn"}>{s === "open" ? "Open" : s === "accepted" ? "Accepted" : "Rejected"}</Chip>
                    </span>
                    <span className="text-[13px]">{n.text}</span>
                    <span className="flex gap-1.5">
                      {(["accepted", "rejected", "open"] as const)
                        .filter((x) => x !== s)
                        .map((x) => (
                          <button key={x} className="btn btn-sm btn-ghost" onClick={() => setNote(n.id, n.text, x)}>
                            {x === "accepted" ? "Accept" : x === "rejected" ? "Reject" : "Reopen"}
                          </button>
                        ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Drafts" kicker="Every draft and revision colour. Compare any two.">
          <ol className="flex flex-wrap gap-2">
            {DRAFTS.map((d, i) => (
              <li key={i} className="tile flex min-w-[78px] flex-col gap-1 !p-2.5">
                <span className="h-1.5 rounded-full" style={{ background: d.colour }} />
                <span className="text-[13px] font-semibold">{d.k}</span>
                <span className="mono text-[12px] muted">{d.on}</span>
                <span className="text-[12px] muted">{d.label}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            Compare
            <select className="rounded-md border border-[var(--line-2)] bg-[var(--raised)] px-2 py-1" value={cmpA} onChange={(e) => setCmpA(+e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>D{n}</option>)}
            </select>
            with
            <select className="rounded-md border border-[var(--line-2)] bg-[var(--raised)] px-2 py-1" value={cmpB} onChange={(e) => setCmpB(+e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>D{n}</option>)}
            </select>
          </div>
          <div className="well mono flex flex-col gap-1 text-[12px]">
            {cmpA === cmpB ? (
              <span className="muted">Pick two different drafts to compare.</span>
            ) : (
              <>
                <span className="muted">
                  D{Math.min(cmpA, cmpB)} to D{Math.max(cmpA, cmpB)}: {Math.abs(cmpB - cmpA) * 9} scenes changed, {Math.abs(cmpB - cmpA) * 3} pages net
                </span>
                <span style={{ color: "var(--ok)" }}>+ sc 79–84 Ravi&apos;s deal now plays on-screen</span>
                <span style={{ color: "var(--risk)" }}>− sc 88 dream sequence removed</span>
                <span style={{ color: "var(--ok)" }}>+ sc 61 Paati&apos;s lines cut from 9 to 2</span>
              </>
            )}
          </div>
        </Panel>

        <Panel title="Table read" kicker="The draft performed in synthetic voices. Slow stretches are marked." right={<AiTag />}>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary !h-11 !w-11 !rounded-full !p-0" aria-label={playing ? "Pause" : "Play"} onClick={() => (t >= totalSecs ? (setT(0), setPlaying(true)) : setPlaying((p) => !p))}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[13px]">
                Sc {nowScene.sc}, {nowScene.t}
              </span>
              <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.08]">
                {TABLE_READ.map((s, i) => {
                  const start = TABLE_READ.slice(0, i).reduce((a, x) => a + x.secs, 0);
                  const fill = Math.max(0, Math.min(1, (t - start) / s.secs));
                  return (
                    <span key={s.sc} className="relative h-full border-r-2 border-[var(--surface)] last:border-0" style={{ width: `${(s.secs / totalSecs) * 100}%` }}>
                      <span className="absolute inset-y-0 left-0" style={{ width: `${fill * 100}%`, background: s.flag ? "var(--warn)" : "var(--accent)" }} />
                    </span>
                  );
                })}
              </div>
            </div>
            <span className="mono text-[12px] muted">
              {fmt(t)} / {fmt(totalSecs)}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {TABLE_READ.map((s) => (
              <li key={s.sc} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span>
                  Sc {s.sc}, {s.t}
                </span>
                <span className="mono flex items-center gap-2 muted">
                  {fmt(s.secs)}
                  {s.flag && <Chip tone="warn">Slow</Chip>}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ================================================================== */
/* Stage 4 · Vault                                                     */
/* ================================================================== */

export function Vault() {
  return (
    <>
      <Panel title="Authorship ledger" kicker="Every version stamped with a tamper-evident time and author.">
        <div className="overflow-x-auto thin-scroll">
          <table className="tbl min-w-[620px]">
            <thead>
              <tr>
                <th>Version</th>
                <th>Author</th>
                <th>Stamped</th>
                <th>Fingerprint</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((l) => (
                <tr key={l.v}>
                  <td className="!text-[var(--ink)]">{l.v}</td>
                  <td>{l.by}</td>
                  <td className="mono text-[12px]">{l.at}</td>
                  <td className="mono text-[12px]">
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.4" aria-hidden>
                        <rect x="4" y="10" width="16" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                      {l.hash}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Registration">
          <ul className="flex flex-col gap-2.5">
            {REGISTRATIONS.map((r) => (
              <li key={r.body} className="flex flex-col gap-1">
                <span className="flex items-center justify-between gap-2 text-[13px]">
                  {r.body} <Chip tone={r.chip as Tone}>{r.state}</Chip>
                </span>
                <span className="mono text-[12px] muted">{r.ref}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Credits" kicker="Proposed by the Credit agent, agreed by the writers.">
          <ul className="flex flex-col gap-2.5">
            {CREDITS.map((c) => (
              <li key={c.credit} className="flex flex-col gap-0.5">
                <span className="text-[12.5px] muted">{c.credit}</span>
                <span className="flex items-center justify-between text-[13px]">
                  {c.who} <Chip tone="ok">Signed</Chip>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Contracts" kicker="Filled from templates, signed online.">
          <ul className="flex flex-col gap-2.5">
            {CONTRACTS.map((c) => (
              <li key={c.k} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="min-w-0 truncate">{c.k}</span>
                <Chip tone={c.state === "Signed" ? "ok" : "warn"}>{c.state}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Who opened the script" kicker="And under which NDA.">
          <ul className="flex flex-col gap-2.5">
            {SHARE_LOG.map((s) => (
              <li key={s.who} className="flex flex-col gap-0.5 text-[13px]">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{s.who}</span>
                  <Chip tone={s.nda === "Missing" ? "risk" : "idle"} plain>
                    {s.nda}
                  </Chip>
                </span>
                <span className="mono text-[12px] muted">{s.when}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
