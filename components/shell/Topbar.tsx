"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBrain } from "@/components/brain/BrainProvider";
import { APPROVALS, FLAGS, PROJECT, ROLES, STAGES, roleById, type RoleId } from "@/lib/data";
import { Avatar } from "@/components/ui";

const ICON: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  desk: "M4 5h16v11H4zM8 20h8M12 16v4",
  agents: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5",
  pipeline: "M4 6h6v4H4zM14 14h6v4h-6zM7 10v4h10",
  guard: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z",
  brain: "M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 3 5h2V4Zm6 0a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-3 5h-2V4Z",
  team: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c0-4 4-6 8-6s8 2 8 6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.5-4.5",
};
const TINT: Record<string, string> = { home: "#3a3d42", desk: "#2d5bd8", agents: "#d1fe17", pipeline: "#8a5cf6", guard: "#e0457b", brain: "#f08a24", team: "#14a39a", search: "#3a3d42" };

function NavIcon({ k }: { k: string }) {
  const dark = k === "agents";
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px]" style={{ background: TINT[k] }} aria-hidden>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={dark ? "#1a1a1a" : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON[k]} />
      </svg>
    </span>
  );
}

const PROJECTS = [
  { title: PROJECT.title, sub: "Pre-production", href: "/stages/prep", live: true },
  { title: "Last Ferry", sub: "Ideate", href: "/stages/ideate" },
  { title: "The Salt Merchant's Daughter", sub: "Ideate", href: "/stages/ideate" },
  { title: "Radio Thatha", sub: "Ideate", href: "/stages/ideate" },
];

export function AppSidebar() {
  const { role, setRole, stageState, activeStage, reset } = useBrain();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const r = roleById(role);
  const working = STAGES.flatMap((s) => (stageState(s.id) === "active" ? s.agents : [])).filter((a) => a.status === "working" || a.status === "idle").length;
  const active = STAGES.find((s) => s.id === activeStage);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nav = [
    { k: "home", href: "/", label: "Home" },
    { k: "desk", href: "/desk", label: r.home },
    { k: "agents", href: "/agents", label: "Agents" },
    { k: "pipeline", href: "/pipeline", label: "Pipeline" },
    { k: "guard", href: "/guardians", label: "Guardians" },
    { k: "brain", href: "/brain", label: "Project Brain" },
    { k: "team", href: "/roles", label: "Team" },
  ];

  const roleSelect = (
    <label className="flex min-w-0 items-center gap-2 rounded-xl bg-[var(--sheet)] p-1.5 pr-2">
      <Avatar name={r.person} size={28} />
      <span className="sr-only">View as</span>
      <select value={role} onChange={(e) => setRole(e.target.value as RoleId)} className="min-w-0 flex-1 cursor-pointer truncate bg-transparent text-[13px] font-medium text-[var(--ink)] outline-none">
        {ROLES.map((x) => (
          <option key={x.id} value={x.id} className="bg-[#1c1e20]">
            {x.person}, {x.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      {/* desktop sidebar */}
      <aside className="thin-scroll sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--rule)] bg-[var(--side)] p-3 lg:flex">
        <Link href="/" className="mb-3 flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]" aria-label="mithraa.SHI home">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white">
            <KolamMark size={22} dark />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold">mithraa.SHI</span>
            <span className="text-[11.5px] muted">Film studio</span>
          </span>
        </Link>

        {nav.map((n) => {
          const on = n.href === "/" ? path === "/" : path === n.href;
          return (
            <Link key={n.k} href={n.href} className={`flex items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-[13.5px] ${on ? "bg-white/[0.07] text-white" : "text-[var(--ink-2)] hover:bg-white/[0.04]"}`}>
              <NavIcon k={n.k} />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-left text-[13.5px] text-[var(--ink-2)] hover:bg-white/[0.04]">
          <NavIcon k="search" />
          <span className="flex-1">Ask SHI</span>
          <kbd className="text-[11px] text-[var(--faint)]">⌘K</kbd>
        </button>

        <div className="mt-5 flex items-center justify-between px-2 pb-1 text-[12.5px] text-[var(--muted)]">
          <span>Projects</span>
          <Link href="/" aria-label="New project" className="rounded-md p-0.5 hover:bg-white/[0.06] hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>
        {PROJECTS.map((p) => {
          const on = p.live && path.startsWith("/stages");
          return (
            <Link key={p.title} href={p.href} className={`flex items-center gap-2.5 rounded-[10px] px-2 py-[7px] ${on ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${p.live ? "bg-[var(--brand)]" : "bg-white/20"}`} />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13.5px]">{p.title}</span>
                <span className="text-[11.5px] muted">{p.sub}</span>
              </span>
            </Link>
          );
        })}
        <Link href="/" className="flex items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-[13.5px] text-[var(--muted)] hover:bg-white/[0.04]">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-dashed border-white/20 text-[14px]">+</span>
          New project
        </Link>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {active && (
            <Link href={`/stages/${active.id}`} className="flex flex-col gap-1 rounded-xl bg-[var(--sheet)] p-3 hover:bg-[var(--sheet-3)]">
              <span className="flex items-center gap-2 text-[12.5px] text-[var(--ink-2)]">
                <span className="rec" /> {working} agents running
              </span>
              <span className="text-[12.5px] muted">
                Waiting at Gate {active.n}, {active.gate.name}
              </span>
            </Link>
          )}
          {roleSelect}
          <button onClick={reset} className="px-2 py-1 text-left text-[12px] text-[var(--faint)] hover:text-[var(--ink-2)]">
            Reset sample data
          </button>
        </div>
      </aside>

      {/* mobile bar */}
      <header className="sticky top-0 z-40 flex flex-col gap-2 border-b border-[var(--rule)] bg-[var(--side)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white">
            <KolamMark size={18} dark />
          </span>
          <span className="text-[14px] font-semibold">mithraa.SHI</span>
          <button onClick={() => setOpen(true)} className="ml-auto rounded-lg bg-[var(--sheet)] px-3 py-1.5 text-[12.5px] text-[var(--ink-2)]">
            Ask SHI
          </button>
        </div>
        <nav aria-label="Main" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
          {[...nav, { k: "kolam", href: `/stages/${active?.id ?? "prep"}`, label: PROJECT.title }].map((n) => {
            const on = n.k === "kolam" ? path.startsWith("/stages") : path === n.href;
            return (
              <Link key={n.k} href={n.href} className={`shrink-0 rounded-[10px] px-3 py-1.5 text-[13px] ${on ? "bg-white text-black" : "text-[var(--ink-2)]"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        {roleSelect}
      </header>

      {open && <AskShi onClose={() => setOpen(false)} />}
    </>
  );
}

export function KolamMark({ size = 26, dark }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {[12, 20, 28].map((x) => [12, 20, 28].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill={dark ? "#0f1113" : "#fff"} opacity=".7" />))}
      <path d="M20 5c7 0 7 10 0 10s-7-10 0-10Zm0 20c7 0 7 10 0 10s-7-10 0-10ZM5 20c0-7 10-7 10 0s-10 7-10 0Zm20 0c0-7 10-7 10 0s-10 7-10 0Z" fill="none" stroke={dark ? "#0f1113" : "var(--brand)"} strokeWidth="2.4" />
    </svg>
  );
}

type Hit = { kind: "go" | "answer"; title: string; sub?: string; href?: string };

function AskShi({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { checks, approvals, flags, activeStage, role } = useBrain();

  useEffect(() => inputRef.current?.focus(), []);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    const active = STAGES.find((x) => x.id === activeStage);
    const answers: Hit[] = [];
    if (!s || /block|gate|ready/.test(s)) {
      if (active) {
        const open = active.gate.items.filter((i) => !checks[i.id]).map((i) => i.label);
        answers.push({
          kind: "answer",
          title: `Gate ${active.n}, ${active.gate.name}: ${open.length ? `${open.length} items still open` : "ready to sign"}`,
          sub: open.length ? open.join("; ") : `Waiting on ${active.gate.approvers.map((r) => roleById(r).label).join(", ")}`,
          href: `/stages/${active.id}#gate`,
        });
      }
    }
    if (/budget|vfx|spend|cost/.test(s)) {
      answers.push({ kind: "answer", title: "VFX is trending 14% over the ₹14.6 Cr baseline", sub: "Budget Guardian suggests shooting 2 time-lapses practically.", href: "/stages/prep#budget" });
    }
    if (/flag|risk|guardian/.test(s)) {
      const openFlags = FLAGS.filter((f) => !flags[f.id]);
      answers.push({ kind: "answer", title: `${openFlags.length} open flags, ${openFlags.filter((f) => f.severity === "high").length} of them high risk`, sub: openFlags[0]?.text, href: "/guardians" });
    }
    if (/approv|sign|waiting|me/.test(s)) {
      const mine = APPROVALS.filter((a) => a.roles.includes(role) && !approvals[a.id]);
      answers.push({ kind: "answer", title: `${mine.length} approvals waiting on you`, sub: mine.map((m) => m.what).slice(0, 3).join("; "), href: "/" });
    }
    if (/cast|nila|actor/.test(s)) {
      answers.push({ kind: "answer", title: "Nila is still uncast; the director's pick is 3 days overdue", sub: "Look-test match: [Actor B] 88, [Actor C] 84, [Actor D] 79", href: "/stages/prep#casting" });
    }
    const go: Hit[] = ([
      { kind: "go", title: "Home", href: "/" },
      { kind: "go", title: "How it runs", href: "/pipeline" },
      { kind: "go", title: "Guardians", href: "/guardians" },
      { kind: "go", title: "Project Brain and activity log", href: "/brain" },
      { kind: "go", title: "Team views", href: "/roles" },
      ...STAGES.map((x) => ({ kind: "go" as const, title: `${x.dashboard} (stage ${x.n}, ${x.name})`, sub: x.goal, href: `/stages/${x.id}` })),
    ] as Hit[]).filter((h) => !s || `${h.title} ${h.sub ?? ""}`.toLowerCase().includes(s));
    return [...answers, ...go].slice(0, 9);
  }, [q, checks, approvals, flags, activeStage, role]);

  const pick = (h: Hit | undefined) => {
    if (h?.href) router.push(h.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 backdrop-blur-sm pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label="Ask SHI"
        className="w-full max-w-[620px] overflow-hidden rounded-[20px] border border-[var(--rule-2)] bg-[#1c1e20] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <span className="rec" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") setSel((v) => Math.min(v + 1, hits.length - 1));
              if (e.key === "ArrowUp") setSel((v) => Math.max(v - 1, 0));
              if (e.key === "Enter") pick(hits[sel]);
            }}
            placeholder="Try “what’s blocking the gate?” or “budget”"
            className="w-full bg-transparent text-[15px] text-[var(--ink)] outline-none focus-visible:outline-none placeholder:text-[var(--faint)]"
          />
          <kbd className="rounded border border-[var(--rule)] px-1.5 text-[11px] muted">esc</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto p-2 thin-scroll">
          {hits.map((h, i) => (
            <li key={h.title}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => pick(h)}
                className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left ${i === sel ? "bg-[var(--raised)]" : ""}`}
              >
                <span className="flex items-center gap-2 text-[13.5px]">
                  {h.kind === "answer" ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" aria-label="Answer" />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full border border-[var(--faint)]" aria-label="Go to" />
                  )}
                  {h.title}
                </span>
                {h.sub && <span className="truncate pl-4 text-[12px] muted">{h.sub}</span>}
              </button>
            </li>
          ))}
          {hits.length === 0 && <li className="px-3 py-6 text-center muted">Nothing in the Project Brain matches “{q}”.</li>}
        </ul>
        <div className="border-t border-[var(--line)] px-4 py-2 text-[11.5px] muted">
          Answers come from the Project Brain. SHI never approves anything for you.
        </div>
      </div>
    </div>
  );
}
