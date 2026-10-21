"use client";

import { useState } from "react";
import { useBrain } from "@/components/brain/BrainProvider";
import { AiTag, Chip, Meter, Panel, type Tone } from "@/components/ui";
import { FlagsPanel } from "@/components/pipeline/parts";
import { PosterTitle, Still } from "@/components/media/Still";
import {
  BURN,
  BURN_PLAN,
  CUTS,
  DELIVERY,
  DEPT_PIPE,
  IP_PIPELINE,
  LANGS,
  POST_MILESTONES,
  POST_RIGHTS,
  PROJECT,
  RELEASE_WINDOWS,
  SHOTS,
  TERRITORIES,
} from "@/lib/data";

/* ================================================================== */
/* Stage 7 · Production Command                                        */
/* ================================================================== */

export function ProductionCommand() {
  const { log } = useBrain();
  const [notes, setNotes] = useState<{ tc: string; text: string }[]>([{ tc: "01:02:14:08", text: "Hold on Paati's hands two beats longer." }]);
  const [draft, setDraft] = useState("");
  const [frame, setFrame] = useState(0);
  const totalShots = SHOTS.notStarted + SHOTS.inProgress + SHOTS.inReview + SHOTS.approved;
  const shotSeg = [
    { k: "Not started", v: SHOTS.notStarted, c: "#3a3a42" },
    { k: "In progress", v: SHOTS.inProgress, c: "var(--info)" },
    { k: "In review", v: SHOTS.inReview, c: "var(--haldi)" },
    { k: "Approved", v: SHOTS.approved, c: "var(--ok)" },
  ];
  const maxWait = Math.max(...DEPT_PIPE.map((d) => d.waiting));
  const W = 300;
  const H = 110;
  const maxY = 50;
  const xy = (i: number, v: number) => [(i / (BURN.length - 1)) * W, H - (v / maxY) * H] as const;
  const line = (arr: number[]) => arr.map((v, i) => xy(i, v).join(",")).join(" ");

  const tc = () => `01:0${frame}:${String(10 + frame * 7).padStart(2, "0")}:${String(frame * 3).padStart(2, "0")}`;

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="card flex flex-col gap-2 xl:col-span-2">
          <span className="text-[13px] text-[var(--ink-2)]">Day 1 of 38, sample call sheet</span>
          <div className="text-[18px] font-semibold">Sc 14 and 15, Paati&apos;s kitchen</div>
          <div className="mono flex flex-wrap gap-x-4 gap-y-1 text-[12px] muted">
            <span>Call 05:30</span>
            <span>Sunrise 06:14</span>
            <span>Weather 24° clear</span>
            <span>On set: 46</span>
          </div>
        </div>
        <div className="card flex flex-col gap-2">
          <span className="text-[13px] text-[var(--ink-2)]">Shots approved</span>
          <span className="display text-[38px]">
            {SHOTS.approved}
            <span className="text-[20px] muted"> / {totalShots}</span>
          </span>
        </div>
        <div className="card flex flex-col gap-2">
          <span className="text-[13px] text-[var(--ink-2)]">Spend against plan</span>
          <span className="display text-[38px]" style={{ color: "var(--warn)" }}>
            107%
          </span>
          <span className="text-[12px] muted">of plan to date (sample)</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Shots" kicker="Every shot moves from not started to in progress, in review and approved.">
          <div className="flex h-7 gap-[2px] overflow-hidden rounded-md" role="img" aria-label="Shots by status">
            {shotSeg.filter((s) => s.v > 0).map((s) => (
              <span key={s.k} style={{ width: `${(s.v / totalShots) * 100}%`, background: s.c }} title={`${s.k}: ${s.v}`} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {shotSeg.map((s) => (
              <li key={s.k} className="tile flex flex-col">
                <span className="flex items-center gap-1.5 text-[12.5px] muted">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.c }} /> {s.k}
                </span>
                <span className="mono text-[18px]">{s.v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Where work is waiting" kicker="Shots queued in each department, routed by the Task Router agent.">
          <ol className="flex flex-wrap items-stretch gap-1.5">
            {DEPT_PIPE.map((d, i) => {
              const hot = d.waiting === maxWait;
              return (
                <li key={d.k} className="flex items-center gap-1.5">
                  <div className={`tile flex min-w-[88px] flex-col items-center !py-2 ${hot ? "!border-[var(--risk)] !bg-[var(--risk-soft)]" : ""}`}>
                    <span className="text-[12px]">{d.k}</span>
                    <span className="mono text-[18px]" style={{ color: hot ? "var(--risk)" : undefined }}>
                      {d.waiting}
                    </span>
                    <span className="text-[12px] muted">waiting</span>
                  </div>
                  {i < DEPT_PIPE.length - 1 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" aria-hidden><path d="m9 6 6 6-6 6" /></svg>}
                </li>
              );
            })}
          </ol>
          <p className="text-[12.5px]">
            <Chip tone="risk">Bottleneck</Chip> <span className="muted">Lighting has 7 shots queued; Review Agent is chasing 2 overdue approvals.</span>
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Dailies" kicker="Scrub to a frame and leave a note on it.">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-2">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--line)]">
                <Still scene={(["kitchen", "station-night", "terrace-night"] as const)[frame]} letterbox className="block w-full" label="Dailies frame" />
                <span className="mono absolute top-2 left-2 rounded bg-black/60 px-1.5 text-[12px]">{tc()}</span>
                <span className="mono absolute top-2 right-2 rounded bg-black/60 px-1.5 text-[12px]">{["14-2", "27-1", "44-3"][frame]}, take {frame + 3}</span>
              </div>
              <input type="range" min={0} max={2} value={frame} onChange={(e) => setFrame(+e.target.value)} aria-label="Scrub" className="accent-[var(--accent)]" />
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  setNotes((n) => [{ tc: tc(), text: draft.trim() }, ...n]);
                  log("left frame note", `${tc()}: ${draft.trim()}`);
                  setDraft("");
                }}
              >
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Note at this frame…" className="min-w-0 flex-1 rounded-lg border border-[var(--line-2)] bg-[var(--bg-2)] px-3 text-[13px] outline-none focus:border-[var(--accent)]" />
                <button className="btn btn-sm">Add</button>
              </form>
            </div>
            <ul className="flex flex-col gap-2">
              {notes.map((n, i) => (
                <li key={i} className="tile flex flex-col gap-0.5 !p-2.5">
                  <span className="mono text-[12px]" style={{ color: "var(--accent-ink)" }}>
                    {n.tc}
                  </span>
                  <span className="text-[12.5px]">{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Burn rate" kicker="Cumulative spend in ₹ lakh over the first 12 shoot days (sample).">
          <svg viewBox={`-28 -8 ${W + 36} ${H + 28}`} className="w-full" role="img" aria-label="Cumulative spend vs plan over 12 days">
            {[0, 25, 50].map((v) => (
              <g key={v}>
                <line x1="0" x2={W} y1={H - (v / maxY) * H} y2={H - (v / maxY) * H} stroke="#26262d" />
                <text x="-6" y={H - (v / maxY) * H + 3} fontSize="9" fill="#8a8a94" textAnchor="end">
                  {v}
                </text>
              </g>
            ))}
            <polyline points={line(BURN_PLAN)} fill="none" stroke="#8a8a94" strokeWidth="1.5" strokeDasharray="4 3" />
            <polyline points={line(BURN)} fill="none" stroke="var(--c1)" strokeWidth="2" strokeLinejoin="round" />
            {BURN.map((v, i) => {
              const [x, y] = xy(i, v);
              return (
                <circle key={i} cx={x} cy={y} r="3" fill="var(--c1)" stroke="var(--surface)" strokeWidth="1.5">
                  <title>{`Day ${i}: ₹${v}L spent vs ₹${BURN_PLAN[i]}L plan`}</title>
                </circle>
              );
            })}
            <text x={W} y={xy(11, BURN[11])[1] - 7} fontSize="9.5" fill="#f4f4f2" fontWeight="700" textAnchor="end">
              Actual ₹{BURN[11]}L
            </text>
            <text x={W} y={xy(11, BURN_PLAN[11])[1] + 13} fontSize="9.5" fill="#8a8a94" textAnchor="end">
              Plan ₹{BURN_PLAN[11]}L
            </text>
            {[0, 6, 11].map((i) => (
              <text key={i} x={xy(i, 0)[0]} y={H + 14} fontSize="9" fill="#8a8a94" textAnchor="middle">
                D{i}
              </text>
            ))}
          </svg>
          <div className="flex gap-4 text-[12px]">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4" style={{ background: "var(--c1)" }} />
              Actual
            </span>
            <span className="flex items-center gap-1.5 muted">
              <span className="h-0 w-4 border-t-2 border-dashed border-[#646d8a]" />
              Plan
            </span>
          </div>
        </Panel>
      </div>

      <FlagsPanel stage="prep" limit={3} />
    </>
  );
}

/* ================================================================== */
/* Stage 8 · Post Suite                                                */
/* ================================================================== */

const cell: Record<string, { t: Tone; l: string }> = {
  ok: { t: "ok", l: "Done" },
  warn: { t: "warn", l: "Waiting" },
  info: { t: "info", l: "Drafting" },
  ai: { t: "ai", l: "AI dub, in review" },
  idle: { t: "idle", l: "Queued" },
};

export function PostSuite() {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Cuts" kicker="Every version of the cut, with who signed off.">
          <ol className="flex flex-col gap-2">
            {CUTS.map((c) => (
              <li key={c.v} className="tile grid grid-cols-[1fr_auto] gap-1">
                <span className="text-[13.5px] font-semibold">{c.v}</span>
                <span className="mono text-[12px]">{c.len}</span>
                <span className="text-[12px] muted">
                  {c.on}, {c.by}
                </span>
                <span>{c.state === "AI draft" ? <AiTag /> : <Chip tone={c.state === "Notes" ? "warn" : "info"}>{c.state}</Chip>}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Post milestones">
          <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {POST_MILESTONES.map((m) => (
              <li key={m.k} className="tile flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">{m.k}</span>
                <span className="mono text-[12.5px] muted">Due {m.due}</span>
                <Chip tone={m.state as Tone}>{m.state === "info" ? "On track" : m.state === "warn" ? "At risk" : "Not started"}</Chip>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Languages" kicker="The Localisation agent drafts subtitles and dubs; people review every one. Dubbing needs the actor's recorded voice consent.">
        <div className="overflow-x-auto thin-scroll">
          <table className="tbl min-w-[560px]">
            <thead>
              <tr>
                <th>Language</th>
                <th>Subtitles</th>
                <th>Dub</th>
                <th>Human review</th>
              </tr>
            </thead>
            <tbody>
              {LANGS.map((l) => (
                <tr key={l.k}>
                  <td className="!text-[var(--ink)]">{l.k}</td>
                  {[l.subs, l.dub, l.review].map((v, i) => (
                    <td key={i}>{v === "—" ? <span className="muted">—</span> : <Chip tone={cell[v].t}>{cell[v].l}</Chip>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Music and stock rights">
          <ul className="flex flex-col gap-2">
            {POST_RIGHTS.map((r) => (
              <li key={r.k} className="flex items-center justify-between gap-3 text-[13px]">
                <span>{r.k}</span>
                <Chip tone={r.state === "Cleared" ? "ok" : "warn"}>{r.state}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Delivery checks" kicker="Each buyer's spec, checked by the Delivery QC agent.">
          <ul className="flex flex-col gap-3">
            {DELIVERY.map((d) => (
              <li key={d.buyer} className="flex flex-col gap-1 text-[13px]">
                <span className="flex justify-between">
                  {d.buyer}
                  <span className="mono" style={{ color: d.pass === d.total ? "var(--ok)" : "var(--warn)" }}>
                    {d.pass}/{d.total} pass
                  </span>
                </span>
                <Meter value={(d.pass / d.total) * 100} color={d.pass === d.total ? "var(--ok)" : "var(--warn)"} label={`${d.buyer} QC`} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ================================================================== */
/* Stage 9 · Release Hub                                               */
/* ================================================================== */

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const WIN_COLOUR: Record<string, string> = { fest: "var(--c3)", theatre: "var(--c1)", ott: "var(--c2)", tv: "var(--c4)" };
const TERR_TONE: Record<string, Tone> = { Sold: "ok", "In talks": "warn", Open: "idle" };

export function ReleaseHub() {
  const { log } = useBrain();
  const [poster, setPoster] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({ "Telugu remake": true });
  const recouped = 9.4;
  const target = PROJECT.budgetCr * 1.2;

  return (
    <>
      <Panel title="Release calendar" kicker="Festival, cinema, streaming and TV windows for a sample year.">
        <div className="overflow-x-auto thin-scroll">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[150px_repeat(12,1fr)] gap-y-1.5 text-[12px]">
              <span />
              {MONTHS.map((m) => (
                <span key={m} className="mono text-center muted">
                  {m}
                </span>
              ))}
              {RELEASE_WINDOWS.map((w) => (
                <div key={w.k} className="contents">
                  <span className="truncate pr-2 text-[12.5px]">{w.k}</span>
                  <span className="relative col-span-12 h-6 rounded bg-[var(--bg-2)]">
                    <span
                      className="absolute inset-y-0.5 rounded"
                      style={{ left: `${(w.from / 12) * 100}%`, width: `${((w.to - w.from) / 12) * 100}%`, background: WIN_COLOUR[w.kind] }}
                      title={`${w.k}: ${MONTHS[w.from]}–${MONTHS[Math.min(11, w.to - 1)]}`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-[12px]">
          {[["fest", "Festival"], ["theatre", "Theatrical"], ["ott", "OTT"], ["tv", "TV"]].map(([k, l]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: WIN_COLOUR[k] }} />
              {l}
            </span>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Territories">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TERRITORIES.map((t) => (
              <li key={t.k} className="tile flex min-h-[72px] flex-col justify-between gap-2" style={{ borderTop: `3px solid var(--${TERR_TONE[t.state] === "idle" ? "line-2" : TERR_TONE[t.state]})` }}>
                <span className="text-[12.5px] leading-tight">{t.k}</span>
                <Chip tone={TERR_TONE[t.state]}>{t.state}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Revenue" kicker="Income by deal, against what investors need back.">
          <div className="flex items-end justify-between">
            <span className="display text-[40px]">₹{recouped} Cr</span>
            <span className="mono text-[12px] muted">of ₹{target.toFixed(1)} Cr to recoup + premium</span>
          </div>
          <Meter value={(recouped / target) * 100} color="var(--c1)" label="Recoupment" />
          <table className="tbl">
            <tbody>
              {[["StreamBay OTT, India", "₹4.0 Cr"], ["Cinemas, India (weeks 1–3)", "₹4.6 Cr"], ["SG & MY theatrical", "₹0.8 Cr"]].map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td className="mono text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Poster options" kicker="Three directions from the Marketing Asset agent. Pick one to brief the designer." right={<AiTag accepted={!!poster} />}>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { id: "A", tag: "ONE LINE. THREE WOMEN.", scene: "kolam" },
                { id: "B", tag: "SOME HOUSES ARE DRAWN", scene: "dawn-courtyard" },
                { id: "C", tag: "IN CINEMAS THIS MARGAZHI", scene: "temple-street" },
              ] as const
            ).map((p) => (
              <button key={p.id} onClick={() => (setPoster(p.id), log("picked poster", `Option ${p.id}`))} className="flex flex-col gap-1.5 text-left">
                <div className={`media media-fade aspect-[2/3] ${poster === p.id ? "ring-2 ring-[var(--brand)]" : ""}`}>
                  <Still scene={p.scene} aspect="poster" label={`Poster option ${p.id}`} />
                  <PosterTitle title="KOLAM" tag={p.tag} />
                </div>
                <span className="text-[12.5px]">
                  <b>Option {p.id}</b> {poster === p.id && <span style={{ color: "var(--ok)" }}>, chosen</span>}
                </span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="What else this story could become" kicker="Remakes, series and spin-offs from the IP Afterlife agent. Sending one creates a new idea in Ideate.">
          <ul className="flex flex-col gap-2">
            {IP_PIPELINE.map((p) => (
              <li key={p.k} className="tile flex items-center justify-between gap-3">
                <span className="flex flex-col">
                  <span className="text-[13.5px] font-semibold">{p.k}</span>
                  <span className="text-[12px] muted">{p.note}</span>
                </span>
                {sent[p.k] ? (
                  <Chip tone="ok">In Ideate</Chip>
                ) : (
                  <button className="btn btn-sm" onClick={() => (setSent((s) => ({ ...s, [p.k]: true })), log("sent to Ideate", p.k))}>
                    Send to Ideate
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
