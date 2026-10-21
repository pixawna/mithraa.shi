# mithraa.SHI — Studio prototype

Idea-to-screen studio OS built from the **Agentic Pipeline & Dashboard Blueprint**:
9 stages, 44 stage agents, 7 guardian agents, one SHI Orchestrator and a shared
Project Brain — with a person approving every stage gate.

Sample project: **Kolam** (Tamil feature · Hindi dub · English subs), currently in
Stage 6 · Pre-production. All numbers are illustrative.

```bash
npm install
npm run dev   # http://localhost:3000
```

## What's in the prototype

A dark, media-first studio in the spirit of creative AI tools: you give it a spark, and watch the agents work.

| Route | Screen |
| --- | --- |
| `/` | **Studio.** What the agents are making right now, a prompt box to start a film from a voice note, line, clipping or book, a live Stage 1 run (Idea Capture, Trend & Market Scout, Premise Scorer, IP Scout) that stops at Gate 1 for you to greenlight, your projects, and fresh agent output. |
| `/desk` | **My desk.** The home screen for whoever you're viewing as (Producer Command Centre, Director's Creative Desk, …), with the production timeline and everything waiting on that person. |
| `/stages/[stage]` | **Project studio.** Cinematic header with the 9 stage tabs, the stage's dashboard panels from the blueprint, and a live rail: the gate checklist, the agents running on the stage, sign-offs and activity. |
| `/agents` | **Agents.** All 44 stage agents and 7 guardians; open one to see what it writes to the Project Brain and run a sample. |
| `/pipeline` | How it runs: the production timeline, the architecture, and every stage's agents and gate. |
| `/guardians` | The 7 guardians and their open flags. |
| `/brain` | Project Brain contents and the live activity log. |
| `/roles` | The 8 team views; pick one to view mithraa as that person. |

### Try this
1. On **Studio**, pick "Voice note" (or type your own idea) and press **Run agents**. Watch the Idea Card get written, then greenlight it at Gate 1.
2. Open **Agents**, pick any agent and run a sample.
3. Switch who you're viewing as (top right) to the *Production Manager* and try ticking Gate 6 on **Kolam**: only the right roles can sign.
4. Switch back to the *Producer*, tick every Gate 6 item and sign. Production opens and its agents start.
5. Press **⌘K** and ask "what's blocking the gate?". Open **Brain** to see every action in the log. **Reset** restores the sample data.

### Guardrails modelled
- Agents draft, flag and suggest; only a person with the right role can approve a gate.
- Anything AI-made carries an **AI-made** label until a person accepts it.
- Row-level visibility: each role only sees its stages.
- Per-agent model spend caps shown to the producer.

## Code map
- `lib/data.ts` — the sample Project Brain (stages, agents, gates, guardians, flags, roles, panel data).
- `components/brain/BrainProvider.tsx` — client state: role, gate checks, approvals, decisions, audit log (persisted to `localStorage`).
- `components/shell/*` — top navigation with role switcher and the Ask SHI palette, toast.
- `components/studio/*` — Studio home, the simulated Stage 1 run (`useRun`) and the idea engine.
- `components/media/Still.tsx` — procedural film stills used for every thumbnail, poster and frame.
- `components/pipeline/parts.tsx` — shared panels: film-strip rail, gate checklist, agents, approvals, flags, feed.
- `components/stages/*` — one dashboard per stage.
- `components/home/Home.tsx`, `components/pages/*` — role desks, agents gallery and the other screens.

Built on Next.js 16 (App Router, Cache Components) + Tailwind CSS v4.
