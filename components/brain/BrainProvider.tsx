"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AUDIT_SEED,
  NOTES,
  STAGES,
  roleById,
  type RoleId,
  type StageId,
} from "@/lib/data";

export type StageState = "passed" | "active" | "locked";
type Decision = "approved" | "rejected";
type FeedDecision = "accepted" | "ignored";
type NoteState = "open" | "accepted" | "rejected";

export interface AuditEntry {
  t: string;
  actor: string;
  kind: "agent" | "person";
  action: string;
  target: string;
}

interface BrainState {
  role: RoleId;
  checks: Record<string, boolean>;
  passed: Partial<Record<StageId, string>>;
  approvals: Record<string, Decision>;
  feed: Record<string, FeedDecision>;
  flags: Record<string, true>;
  notes: Record<string, NoteState>;
  audit: AuditEntry[];
}

function initialState(): BrainState {
  const checks: Record<string, boolean> = {};
  const passed: Partial<Record<StageId, string>> = {};
  for (const s of STAGES) {
    for (const i of s.gate.items) checks[i.id] = i.done;
    if (s.passed) passed[s.id] = s.passedOn ?? "";
  }
  const notes: Record<string, NoteState> = {};
  for (const n of NOTES) notes[n.id] = n.state;
  return {
    role: "producer",
    checks,
    passed,
    approvals: {},
    feed: {},
    flags: {},
    notes,
    audit: AUDIT_SEED as AuditEntry[],
  };
}

const KEY = "mithraa-shi-brain-v1";

interface BrainApi extends BrainState {
  hydrated: boolean;
  stageState: (id: StageId) => StageState;
  activeStage: StageId | undefined;
  /** People only: agents can never hold an approver role. */
  canSign: (approvers: RoleId[]) => boolean;
  setRole: (r: RoleId) => void;
  toggleCheck: (stage: StageId, itemId: string) => void;
  passGate: (stage: StageId) => void;
  decide: (id: string, label: string, d: Decision) => void;
  decideFeed: (id: string, label: string, d: FeedDecision) => void;
  resolveFlag: (id: string, label: string) => void;
  setNote: (id: string, label: string, s: NoteState) => void;
  log: (action: string, target: string) => void;
  toast: string | null;
  notify: (msg: string) => void;
  reset: () => void;
}

const Ctx = createContext<BrainApi | null>(null);

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function BrainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrainState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved demo state once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<BrainState>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        setState((s) => ({ ...s, ...saved }));
      }
    } catch {
      /* storage unavailable: run with defaults */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const actorName = useCallback(
    (role: RoleId) => {
      const r = roleById(role);
      return `${r.person} (${r.label})`;
    },
    [],
  );

  const push = useCallback(
    (s: BrainState, action: string, target: string): AuditEntry[] => [
      { t: now(), actor: actorName(s.role), kind: "person" as const, action, target },
      ...s.audit,
    ].slice(0, 60),
    [actorName],
  );

  const activeStage = useMemo(
    () => STAGES.find((s) => !state.passed[s.id])?.id,
    [state.passed],
  );

  const stageState = useCallback(
    (id: StageId): StageState =>
      state.passed[id] !== undefined ? "passed" : id === activeStage ? "active" : "locked",
    [state.passed, activeStage],
  );

  const canSign = useCallback((approvers: RoleId[]) => approvers.includes(state.role), [state.role]);

  const api: BrainApi = {
    ...state,
    hydrated,
    stageState,
    activeStage,
    canSign,
    toast,
    notify,
    setRole: (role) =>
      setState((s) => ({ ...s, role, audit: [{ t: now(), actor: actorName(role), kind: "person" as const, action: "signed in", target: roleById(role).home }, ...s.audit].slice(0, 60) })),
    toggleCheck: (stage, itemId) => {
      const st = STAGES.find((s) => s.id === stage)!;
      if (!canSign(st.gate.approvers)) {
        notify(`Only the ${st.gate.approvers.map((r) => roleById(r).label).join(", ")} can tick Gate ${st.n}.`);
        return;
      }
      if (stageState(stage) !== "active") {
        notify(stageState(stage) === "passed" ? "This gate is already signed." : "This stage hasn't opened yet.");
        return;
      }
      const item = st.gate.items.find((i) => i.id === itemId)!;
      setState((s) => {
        const on = !s.checks[itemId];
        return { ...s, checks: { ...s.checks, [itemId]: on }, audit: push(s, on ? "confirmed" : "un-confirmed", `Gate ${st.n}: ${item.label}`) };
      });
    },
    passGate: (stage) => {
      const st = STAGES.find((s) => s.id === stage)!;
      if (!canSign(st.gate.approvers)) {
        notify("Only a person with the right role can sign a gate.");
        return;
      }
      setState((s) => {
        if (!st.gate.items.every((i) => s.checks[i.id])) return s;
        const d = new Date();
        const on = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        return { ...s, passed: { ...s.passed, [stage]: on }, audit: push(s, "signed", `Gate ${st.n}, ${st.gate.name}`) };
      });
      const next = STAGES[st.n];
      notify(next ? `Gate ${st.n} signed. ${next.name} is open and its agents have started.` : `Gate ${st.n} signed.`);
    },
    decide: (id, label, d) =>
      setState((s) => {
        const cur = s.approvals[id];
        const approvals = { ...s.approvals };
        if (cur === d) delete approvals[id];
        else approvals[id] = d;
        return { ...s, approvals, audit: push(s, cur === d ? "reopened" : d, label) };
      }),
    decideFeed: (id, label, d) =>
      setState((s) => ({ ...s, feed: { ...s.feed, [id]: d }, audit: push(s, d, label) })),
    resolveFlag: (id, label) =>
      setState((s) => ({ ...s, flags: { ...s.flags, [id]: true }, audit: push(s, "resolved flag", label) })),
    setNote: (id, label, ns) =>
      setState((s) => ({ ...s, notes: { ...s.notes, [id]: ns }, audit: push(s, ns === "open" ? "reopened note" : ns, label) })),
    log: (action, target) => setState((s) => ({ ...s, audit: push(s, action, target) })),
    reset: () => {
      setState(initialState());
      notify("Sample project restored.");
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useBrain() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBrain must be used inside <BrainProvider>");
  return v;
}
