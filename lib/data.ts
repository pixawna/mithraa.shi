/**
 * mithraa.SHI — sample Project Brain.
 *
 * Everything the UI shows comes from here. In production these records live in
 * the Project Brain (PostgreSQL + vector index + knowledge graph); agents read
 * and write them, people approve them. Numbers are illustrative.
 */

export type StageId =
  | "ideate"
  | "develop"
  | "write"
  | "protect"
  | "finance"
  | "prep"
  | "production"
  | "post"
  | "release";

export type RoleId =
  | "producer"
  | "director"
  | "writer"
  | "investor"
  | "pm"
  | "hod"
  | "crew"
  | "client";

export type AgentStatus = "done" | "working" | "needs" | "idle";

export interface Agent {
  name: string;
  does: string;
  writes: string;
  status: AgentStatus;
  task: string;
  /** monthly model spend cap shown to the producer (₹ thousand) */
  budgetK: number;
  spentK: number;
}

export interface GateItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Stage {
  id: StageId;
  n: number;
  name: string;
  dashboard: string;
  goal: string;
  input: string;
  output: string;
  gate: {
    name: string;
    rule: string;
    approvers: RoleId[];
    items: GateItem[];
  };
  agents: Agent[];
  /** gate passed at the start of the demo */
  passed: boolean;
  /** planned window, ISO dates */
  start: string;
  end: string;
  passedOn?: string;
}

const a = (
  name: string,
  does: string,
  writes: string,
  status: AgentStatus,
  task: string,
  budgetK = 40,
  spentK = 0,
): Agent => ({ name, does, writes, status, task, budgetK, spentK });

const g = (id: string, label: string, done: boolean): GateItem => ({ id, label, done });

export const TODAY = "2026-10-21";

export const PROJECT = {
  title: "Kolam",
  logline:
    "When Paati enters one last kolam contest, her two estranged granddaughters come home to Kumbakonam to help — and find the drawing on the doorstep is a map of everything the family never said.",
  format: "Tamil feature, Hindi dub, English subs",
  code: "KLM-26",
  runtime: "2h 08m (target)",
  scenes: 112,
  shootDays: 38,
  budgetCr: 14.6,
  nextGate: { n: 6, name: "Shoot Ready", on: "3 Nov 2026", days: 13 },
};

export const STAGES: Stage[] = [
  {
    id: "ideate",
    n: 1,
    start: "2026-06-01",
    end: "2026-06-18",
    name: "Ideate",
    dashboard: "Idea Studio",
    goal: "Turn raw sparks into a shortlist of scored, rights-clear ideas worth developing.",
    input: "Anything: a voice note, one line, a news clipping, a book.",
    output: "An Idea Card per idea in the Project Brain.",
    passed: true,
    passedOn: "18 Jun",
    gate: {
      name: "Idea Greenlight",
      rule: "The creator or producer moves 1–3 ideas into development. Agents never pick the winner.",
      approvers: ["producer", "writer"],
      items: [
        g("i1", "Every shortlisted idea scored with reasons", true),
        g("i2", "Source rights checked for adaptations", true),
        g("i3", "Producer greenlight recorded", true),
      ],
    },
    agents: [
      a("Idea Capture Agent", "Turns voice notes, photos and scribbles into a clean Idea Card with logline, genre and tone", "Idea Card", "done", "17 voice notes turned into Idea Cards", 20, 6),
      a("Trend & Market Scout", "Reads what is working by genre, language and territory, and what is oversaturated", "Market notes on each card", "done", "Tamil family drama: rising on OTT, low saturation", 30, 14),
      a("Premise Scorer", "Scores originality, audience fit, budget band and franchise potential, and explains each score", "Score card with reasons", "done", "17 ideas scored, 4 above 80", 20, 9),
      a("IP Scout", "Finds adaptable books, stories and true events, and checks whether rights look available", "IP leads, rights status", "done", "3 short-story leads, 2 rights open", 25, 11),
    ],
  },
  {
    id: "develop",
    n: 2,
    start: "2026-06-18",
    end: "2026-07-29",
    name: "Develop",
    dashboard: "Story Room",
    goal: "Build the story world and structure before a single scene is written.",
    input: "A greenlit Idea Card.",
    output: "The Story Bible and an approved scene order.",
    passed: true,
    passedOn: "29 Jul",
    gate: {
      name: "Story Approval",
      rule: "The writer and director approve the treatment and scene order; the producer signs off on scale.",
      approvers: ["writer", "director", "producer"],
      items: [
        g("d1", "Treatment approved by writer and director", true),
        g("d2", "Scene order locked", true),
        g("d3", "Scale signed off by producer", true),
      ],
    },
    agents: [
      a("World Builder", "Expands the premise into setting, rules, history and themes", "Story Bible: world", "done", "Kumbakonam, 1994 & 2026, Margazhi season", 30, 12),
      a("Character Architect", "Builds characters with backstory, wants, arcs and relationships; flags flat or duplicate characters", "Story Bible: characters, relationship map", "done", "6 characters, 9 relationships, 1 merge suggested", 30, 15),
      a("Structure Agent", "Lays the story onto a chosen structure and drafts synopsis, treatment, one-line order and scene order", "Structure, treatment, scene order", "done", "Two-half structure, interval twist at sc 61", 35, 19),
      a("Research Agent", "Gathers period, cultural and technical reference and pins it to scenes", "Research boards", "done", "58 references pinned, kolam patterns, temple calendar", 25, 13),
    ],
  },
  {
    id: "write",
    n: 3,
    start: "2026-07-29",
    end: "2026-09-02",
    name: "Write",
    dashboard: "Writers' Room",
    goal: "A locked shooting script, written in the team's own languages.",
    input: "Story Bible and scene order.",
    output: "Versioned drafts and a locked script.",
    passed: true,
    passedOn: "2 Sep",
    gate: {
      name: "Script Lock",
      rule: "The director and producer lock a draft. Later changes become colour-coded revision pages.",
      approvers: ["director", "producer"],
      items: [
        g("w1", "All notes resolved", true),
        g("w2", "Page count in range (104–118)", true),
        g("w3", "Lock approved by director and producer", true),
      ],
    },
    agents: [
      a("Script Format Agent", "Keeps industry formatting across languages and mixed-language scripts, with transliteration", "Formatted drafts", "done", "Draft 5, Tamil dialogue, English action", 20, 7),
      a("Co-writer Agent", "Drafts a scene, an alternate or a bridge only when a writer asks; the writer edits or discards", "Suggested pages, marked as AI", "done", "5 alternates offered, 1 kept, rewritten", 40, 22),
      a("Coverage Agent", "Notes on pacing, structure, character consistency against the Story Bible, and plot holes", "Coverage report per draft", "done", "Second-half sag flagged in D3, cleared in D5", 30, 18),
      a("Dialogue Agent", "Flags flat, repeated or out-of-character lines and checks dialect consistency", "Line-level notes", "done", "24 line notes, 22 resolved, 2 rejected", 20, 9),
      a("Table Read Agent", "Performs the draft in synthetic voices and marks slow or confusing stretches", "Audio read, timing per scene", "done", "Full read 2h 11m, 3 slow stretches", 45, 31),
    ],
  },
  {
    id: "protect",
    n: 4,
    start: "2026-09-02",
    end: "2026-09-11",
    name: "Lock & Protect",
    dashboard: "Vault",
    goal: "The script and its creators are protected before the script leaves the room.",
    input: "The locked script.",
    output: "Authorship proof, registration, signed credits and contracts.",
    passed: true,
    passedOn: "11 Sep",
    gate: {
      name: "Protection Complete",
      rule: "The writer confirms registration; all credit parties sign. The script cannot be shared outside the core team until this gate passes.",
      approvers: ["writer", "producer"],
      items: [
        g("p1", "Registered with SWA", true),
        g("p2", "Credits signed by all parties", true),
        g("p3", "NDAs in place for everyone with access", true),
      ],
    },
    agents: [
      a("Authorship Agent", "Stamps every idea, draft and Story Bible page with a tamper-evident timestamp and author record", "Authorship ledger", "done", "31 versions stamped", 10, 3),
      a("Registration Agent", "Prepares the filing pack for SWA, WGA or WGGB and tracks its status", "Registration status, receipts", "done", "SWA receipt #SWA-2026-118204", 10, 2),
      a("Credit Agent", "Proposes story and screenplay credits from the contribution history, for the team to agree", "Draft credit sheet", "done", "Credits agreed and signed", 10, 3),
      a("Contract Agent", "Fills NDA, writer and collaborator agreements from templates and routes them for e-signature", "Contracts, signature status", "done", "11 NDAs, 2 writer agreements signed", 15, 6),
    ],
  },
  {
    id: "finance",
    n: 5,
    start: "2026-09-11",
    end: "2026-10-06",
    name: "Package & Finance",
    dashboard: "Deal Room",
    goal: "Turn a protected script into a funded project.",
    input: "Locked script and Story Bible.",
    output: "Pitch kit, early budget, matched investors and a signed deal.",
    passed: true,
    passedOn: "6 Oct",
    gate: {
      name: "Financing Close",
      rule: "The producer and investors sign. The Budget Guardian locks the approved budget as the baseline.",
      approvers: ["producer", "investor"],
      items: [
        g("f1", "Budget approved and baselined", true),
        g("f2", "Funding committed to 100%", true),
        g("f3", "Investor agreements signed", true),
      ],
    },
    agents: [
      a("Pitch Kit Agent", "Builds the pitch deck, lookbook, mood board and one-pager from the Story Bible", "Pitch kit", "done", "Deck v3, lookbook, one-pager", 35, 21),
      a("Teaser Agent", "Generates a concept teaser or sizzle that sells tone and world", "Teaser video, marked as AI", "done", "45-second mood teaser (AI, accepted)", 80, 64),
      a("Top-Sheet Agent", "Estimates an early budget by scene count, locations, cast scale and VFX load", "Budget top-sheet", "done", "₹14.6 Cr top-sheet", 15, 5),
      a("Funding Match Agent", "Matches the project to investors, co-producers, film funds, grants and shooting incentives", "Ranked funding leads", "done", "14 matched, 4 committed", 25, 12),
      a("Deal Room Agent", "Drafts term sheets and recoupment waterfalls and tracks each negotiation", "Deal records", "done", "Term sheet + waterfall v2 signed", 20, 10),
    ],
  },
  {
    id: "prep",
    n: 6,
    start: "2026-10-06",
    end: "2026-11-03",
    name: "Pre-production",
    dashboard: "Prep Control",
    goal: "A shoot-ready plan where every scene has its cast, crew, location, look, budget line and day.",
    input: "Locked script, approved budget.",
    output: "Breakdown, boards, visual development, cast, locations, crew and schedule.",
    passed: false,
    gate: {
      name: "Shoot Ready",
      rule: "The producer, director and every HOD sign the schedule, budget and look. Nothing is shot before this gate.",
      approvers: ["producer", "director", "hod"],
      items: [
        g("r1", "Every scene cast", false),
        g("r2", "Every scene located", false),
        g("r3", "Schedule signed by all HODs", false),
        g("r4", "Budget within locked baseline", true),
        g("r5", "Boards and look approved", false),
      ],
    },
    agents: [
      a("Breakdown Agent", "Extracts characters, props, costumes, locations, VFX, vehicles and extras per scene", "Breakdown sheets", "done", "112 scenes broken down, 640 elements", 25, 14),
      a("Storyboard Agent", "Draws shot-by-shot boards with characters kept consistent across frames", "Storyboards, animatics", "working", "Boarding sc 18–26, 61% of script done", 90, 58),
      a("Visual Dev Agent", "Generates concept art, character turnarounds, facial data sheets and costume options", "Visual development library", "working", "Nila costume options v2 in review", 80, 47),
      a("Budget Agent", "Turns the top-sheet into a line-item budget from the breakdown", "Detailed budget", "working", "Line-item budget 96% complete", 20, 11),
      a("Casting Agent", "Builds role briefs, shortlists from audition uploads, runs AI look-tests, checks availability", "Cast shortlist, look-tests", "needs", "2 of 6 roles need a director pick", 50, 33),
      a("Location Agent", "Matches scenes to scouted locations, compiles recce reports, tracks permits", "Location plan, permits", "working", "8 of 10 locations locked, 2 permits pending", 20, 9),
      a("Crew Agent", "Proposes crew across all 24 crafts from the talent marketplace, by skill, language and availability", "Crew shortlist", "working", "22 of 24 crafts filled", 15, 6),
      a("Scheduling Agent", "Builds the stripboard and day-out-of-days around cast dates, locations and daylight", "Shooting schedule", "working", "38-day stripboard v4", 20, 12),
    ],
  },
  {
    id: "production",
    n: 7,
    start: "2026-11-05",
    end: "2026-12-23",
    name: "Production",
    dashboard: "Production Command",
    goal: "Shoot and build every scene on time and on budget, for live action, VFX and animation alike.",
    input: "The shoot-ready plan.",
    output: "Approved footage, assets and shots.",
    passed: false,
    gate: {
      name: "Picture Wrap",
      rule: "Every scheduled scene is shot or built and approved by the director.",
      approvers: ["director"],
      items: [
        g("x1", "All scheduled scenes complete", false),
        g("x2", "All shots approved", false),
        g("x3", "Footage backed up in two places", false),
      ],
    },
    agents: [
      a("Call Sheet Agent", "Generates tomorrow's call sheet from the schedule, sends it to each person, and builds the DPR", "Call sheets, DPRs", "idle", "Waiting for Gate 6"),
      a("Task Router Agent", "Splits approved shots into tasks and routes them modeling → rigging → animation → lighting → render", "Task assignments, status", "idle", "Waiting for Gate 6"),
      a("On-set Log Agent", "Captures script supervisor notes, sound reports and camera logs against each take", "Take logs", "idle", "Waiting for Gate 6"),
      a("Dailies Agent", "Ingests footage, checks backups, makes proxies and queues dailies for review", "Dailies, backup checks", "idle", "Waiting for Gate 6"),
      a("Review Agent", "Collects frame-accurate notes, routes approvals Artist → HOD → Director → Producer → Client, chases overdue reviews", "Approval history", "idle", "Waiting for Gate 6"),
    ],
  },
  {
    id: "post",
    n: 8,
    start: "2027-01-04",
    end: "2027-03-19",
    name: "Post & Localise",
    dashboard: "Post Suite",
    goal: "One finished master, delivered in every language and format buyers need.",
    input: "Approved footage and shots.",
    output: "Final cut, mix, localised versions, certificate and deliverables.",
    passed: false,
    gate: {
      name: "Final Delivery",
      rule: "The director approves the final cut, QC passes, the certificate is issued and the buyer accepts delivery.",
      approvers: ["director", "producer", "client"],
      items: [
        g("o1", "Final cut locked", false),
        g("o2", "CBFC certificate issued", false),
        g("o3", "Deliverables accepted by buyer", false),
      ],
    },
    agents: [
      a("Edit Assist Agent", "Assembles a first cut from the script and take logs, and tracks cut versions and conform lists", "Assembly cut, cut history", "idle", "Locked until Gate 7"),
      a("Sound & Music Agent", "Tracks mix stages, builds cue sheets and checks every music licence", "Cue sheets, licence status", "idle", "Locked until Gate 7"),
      a("Localisation Agent", "Drafts subtitles and AI dubs in each language, matched to lip sync, for human review", "Subtitle and dub tracks", "idle", "Locked until Gate 7"),
      a("Certification Agent", "Prepares the CBFC application, tracks the review and logs any cuts asked for", "Certificate status", "idle", "Locked until Gate 7"),
      a("Delivery QC Agent", "Checks every deliverable against each OTT or distributor spec before it is sent", "QC reports", "idle", "Locked until Gate 7"),
    ],
  },
  {
    id: "release",
    n: 9,
    start: "2027-03-22",
    end: "2027-06-30",
    name: "Release & Monetise",
    dashboard: "Release Hub",
    goal: "Get the title seen, sold and earning, then reuse it as IP.",
    input: "The delivered title.",
    output: "Releases, deals, revenue reports and IP records.",
    passed: false,
    gate: {
      name: "Release",
      rule: "The producer approves each release, and each rights deal is signed before it goes live.",
      approvers: ["producer"],
      items: [
        g("l1", "Release approved", false),
        g("l2", "Rights clear in every live territory", false),
        g("l3", "Campaign assets approved", false),
      ],
    },
    agents: [
      a("Festival Agent", "Finds fitting festivals and markets, tracks deadlines and prepares submission packs", "Festival plan, submissions", "idle", "Locked until Gate 8"),
      a("Marketing Asset Agent", "Generates poster, trailer cut-down and social options, and versions press kits", "Marketing library", "idle", "Locked until Gate 8"),
      a("Sales & Rights Agent", "Tracks territory rights, licensing windows, buyers and revenue per deal", "Rights map, revenue log", "idle", "Locked until Gate 8"),
      a("IP Afterlife Agent", "Spots remake, dub, sequel and spin-off opportunities and feeds them back to Stage 1", "New Idea Cards", "idle", "Locked until Gate 8"),
    ],
  },
];

export const stageById = (id: string) => STAGES.find((s) => s.id === id);

/* ------------------------------------------------------------------ */
/* Guardians                                                           */
/* ------------------------------------------------------------------ */

export type Severity = "high" | "medium" | "low";

export interface Guardian {
  id: string;
  name: string;
  watches: string;
  raisesWhen: string;
  checksToday: number;
}

export const GUARDIANS: Guardian[] = [
  { id: "continuity", name: "Continuity Guardian", watches: "Characters, costumes, props, looks and story facts against the Story Bible", raisesWhen: "A frame, page or asset contradicts what was approved", checksToday: 412 },
  { id: "budget", name: "Budget Guardian", watches: "Every estimate and spend against the locked baseline", raisesWhen: "A department trends over budget or contingency runs low", checksToday: 96 },
  { id: "rights", name: "Rights Guardian", watches: "Ownership of ideas, source IP, music, stock, likeness and voice", raisesWhen: "Something is used without clear rights or consent", checksToday: 58 },
  { id: "security", name: "Security Guardian", watches: "Access, downloads and sharing under role-based access control", raisesWhen: "Unusual access, a leak risk or a missing NDA", checksToday: 233 },
  { id: "compliance", name: "Compliance Guardian", watches: "Unions, labour hours, permits, CBFC, data-protection rules", raisesWhen: "A schedule or document would break a rule", checksToday: 74 },
  { id: "comms", name: "Comms Agent", watches: "Messages, notifications and reminders between people and agents", raisesWhen: "An approval or reply is overdue", checksToday: 140 },
  { id: "insight", name: "Insight Agent", watches: "Progress, cost and quality across the project", raisesWhen: "It spots a trend worth a producer's attention, in a weekly summary", checksToday: 12 },
];

export interface Flag {
  id: string;
  guardian: string;
  severity: Severity;
  stage: StageId;
  owner: RoleId;
  text: string;
  evidence: string;
  fix: string;
}

export const FLAGS: Flag[] = [
  { id: "fl1", guardian: "Continuity Guardian", severity: "high", stage: "prep", owner: "director", text: "Nila's half-saree is turmeric yellow in board 18-2 but parrot green in 19-1, on the same day in story time.", evidence: "Boards 18-2, 19-1, Costume look #3 (approved 8 Oct)", fix: "Re-render 19-1 with approved look #3." },
  { id: "fl2", guardian: "Budget Guardian", severity: "high", stage: "prep", owner: "producer", text: "VFX line (rangoli time-lapse, 6 shots) trending 14% over the locked baseline.", evidence: "Budget v4 line 4120, ₹38.2L vs ₹33.5L baseline", fix: "Shoot 2 time-lapses practically, or draw ₹4.7L from contingency." },
  { id: "fl3", guardian: "Rights Guardian", severity: "medium", stage: "prep", owner: "producer", text: "Look-test for Paati used a reference actor's likeness without recorded consent.", evidence: "Casting look-test LT-07, consent record missing", fix: "Collect consent or regenerate LT-07 from the cast actor only." },
  { id: "fl4", guardian: "Compliance Guardian", severity: "medium", stage: "prep", owner: "pm", text: "Day 22 night shoot breaks the 12-hour crew limit by 1h 40m.", evidence: "Stripboard v4, Day 22 call 14:00 → wrap 03:40", fix: "Move sc 88 (terrace) to Day 23 morning." },
  { id: "fl5", guardian: "Security Guardian", severity: "low", stage: "prep", owner: "producer", text: "New location scout opened the script without an NDA on file.", evidence: "Share log, 19 Oct 21:14, user loc-scout-04", fix: "Send NDA; access auto-paused until signed." },
  { id: "fl6", guardian: "Comms Agent", severity: "low", stage: "prep", owner: "director", text: "Casting pick for Nila is 3 days overdue.", evidence: "Approval AP-1, requested 18 Oct", fix: "Review 3 look-tests (8 min)." },
];

/* ------------------------------------------------------------------ */
/* Approvals waiting on people                                          */
/* ------------------------------------------------------------------ */

export interface Approval {
  id: string;
  what: string;
  from: string;
  stage: StageId;
  roles: RoleId[];
  ai?: boolean;
}

export const APPROVALS: Approval[] = [
  { id: "ap1", what: "Cast Nila from 3 look-tests", from: "Casting Agent", stage: "prep", roles: ["director", "producer"], ai: true },
  { id: "ap2", what: "VFX line +14% over baseline", from: "Budget Guardian", stage: "prep", roles: ["producer"] },
  { id: "ap3", what: "Temple street recce report", from: "Location Agent", stage: "prep", roles: ["director", "pm"] },
  { id: "ap4", what: "Stripboard v4, 38 shoot days", from: "Scheduling Agent", stage: "prep", roles: ["producer", "pm", "hod"] },
  { id: "ap5", what: "Boards sc 12–17", from: "Storyboard Agent", stage: "prep", roles: ["director"], ai: true },
  { id: "ap6", what: "Costume dept budget line", from: "Costume HOD", stage: "prep", roles: ["hod", "producer"] },
  { id: "ap7", what: "Revision pages (blue) sc 44", from: "Writer 2", stage: "write", roles: ["writer", "director"] },
];

/* ------------------------------------------------------------------ */
/* Agent feed                                                           */
/* ------------------------------------------------------------------ */

export interface FeedItem {
  id: string;
  time: string;
  agent: string;
  text: string;
  stage: StageId;
  suggestion?: boolean;
}

export const FEED: FeedItem[] = [
  { id: "e1", time: "10:48", agent: "Storyboard Agent", text: "Boarded sc 18–19 (9 frames), characters matched to turnarounds.", stage: "prep", suggestion: true },
  { id: "e2", time: "10:31", agent: "Continuity Guardian", text: "Flagged a costume mismatch between boards 18-2 and 19-1.", stage: "prep" },
  { id: "e3", time: "10:05", agent: "Scheduling Agent", text: "Suggests swapping Day 7 and Day 9 to save one company move (₹1.8L).", stage: "prep", suggestion: true },
  { id: "e4", time: "09:40", agent: "Location Agent", text: "Uploaded recce for Sarangapani temple street with sun path.", stage: "prep" },
  { id: "e5", time: "09:12", agent: "Crew Agent", text: "Shortlisted 3 boom operators fluent in Tamil and Hindi.", stage: "prep", suggestion: true },
  { id: "e6", time: "08:50", agent: "Insight Agent", text: "Prep is pacing 4 days ahead on locations, 3 days behind on boards.", stage: "prep" },
  { id: "e7", time: "Mon", agent: "Trend & Market Scout", text: "Two new family-drama hits on OTT this month in Tamil and Malayalam.", stage: "ideate", suggestion: true },
  { id: "e8", time: "Mon", agent: "IP Scout", text: "Found 'The Salt Merchant's Daughter' (1971). Rights appear to be open.", stage: "ideate", suggestion: true },
];

/* ------------------------------------------------------------------ */
/* Roles                                                                */
/* ------------------------------------------------------------------ */

export interface Role {
  id: RoleId;
  label: string;
  person: string;
  home: string;
  panels: string[];
  actions: string[];
  stages: StageId[];
}

const ALL: StageId[] = STAGES.map((s) => s.id);

export const ROLES: Role[] = [
  { id: "producer", label: "Producer", person: "Revathi K.", home: "Command Centre", panels: ["9-stage rail", "Budget vs baseline", "Burn rate", "Funding stack", "Guardian flags", "Gates awaiting sign-off"], actions: ["Approve gates", "Lock budgets", "Sign deals"], stages: ALL },
  { id: "director", label: "Director", person: "Arjun V.", home: "Creative Desk", panels: ["Story approvals", "Boards & look approvals", "Dailies", "Cut versions"], actions: ["Approve creative work", "Leave frame notes"], stages: ["develop", "write", "prep", "production", "post"] },
  { id: "writer", label: "Writer", person: "Meenakshi R.", home: "Writers' Room", panels: ["Script editor", "Coverage", "Notes inbox", "Authorship ledger", "Credits"], actions: ["Write", "Accept or reject notes", "Register"], stages: ["ideate", "develop", "write", "protect"] },
  { id: "investor", label: "Investor", person: "Northstar Pictures", home: "Investor View", panels: ["Stage progress", "Spend vs budget", "Release & revenue"], actions: ["Review", "Comment", "Sign deal documents"], stages: ["finance", "release"] },
  { id: "pm", label: "Production Manager", person: "Senthil P.", home: "Ops Board", panels: ["Schedule", "Call sheets", "Task routing", "Bottlenecks", "Overdue approvals"], actions: ["Assign", "Reschedule", "Chase"], stages: ["prep", "production", "post"] },
  { id: "hod", label: "Costume HOD", person: "Farah S.", home: "Department Board", panels: ["Department tasks", "Review queue", "Budget line", "Crew"], actions: ["Approve department work", "Assign artists"], stages: ["prep", "production"] },
  { id: "crew", label: "Artist & Crew", person: "Ilango (Storyboard)", home: "My Work", panels: ["Assigned tasks", "Call times", "References", "Submission history"], actions: ["Upload work", "See feedback"], stages: ["prep", "production"] },
  { id: "client", label: "Client / Buyer", person: "StreamBay OTT", home: "Review Portal", panels: ["Deliverables to review", "Delivery specs", "QC reports"], actions: ["Approve or reject", "Comment"], stages: ["post", "release"] },
];

export const roleById = (id: RoleId) => ROLES.find((r) => r.id === id)!;

/* ------------------------------------------------------------------ */
/* Stage sample data                                                    */
/* ------------------------------------------------------------------ */

export type IdeaLane = "raw" | "exploring" | "developing" | "parked";
export interface Idea {
  id: string;
  title: string;
  line: string;
  lane: IdeaLane;
  scores: { originality: number; audience: number; budget: number; franchise: number };
  source: "voice note" | "one-liner" | "clipping" | "book";
}

export const IDEAS: Idea[] = [
  { id: "kolam", title: "Kolam", line: "Paati's last kolam contest brings two estranged sisters home.", lane: "developing", scores: { originality: 84, audience: 92, budget: 86, franchise: 58 }, source: "voice note" },
  { id: "ferry", title: "Last Ferry to Rameswaram", line: "A ferry pilot's final week before the bridge opens.", lane: "exploring", scores: { originality: 79, audience: 74, budget: 71, franchise: 40 }, source: "clipping" },
  { id: "salt", title: "The Salt Merchant's Daughter", line: "1971 novel, a girl inherits a failing salt pan.", lane: "exploring", scores: { originality: 72, audience: 77, budget: 64, franchise: 55 }, source: "book" },
  { id: "radio", title: "Radio Thatha", line: "A grandfather's pirate FM station becomes the town's voice.", lane: "raw", scores: { originality: 81, audience: 66, budget: 90, franchise: 62 }, source: "one-liner" },
  { id: "jasmine", title: "Jasmine Hours", line: "Night flower-market workers and one missing ledger.", lane: "raw", scores: { originality: 69, audience: 63, budget: 82, franchise: 48 }, source: "voice note" },
  { id: "orbit", title: "Orbit Amma", line: "A mother trains for a private space flight at 61.", lane: "parked", scores: { originality: 88, audience: 70, budget: 31, franchise: 72 }, source: "one-liner" },
];

export const MARKET = [
  { k: "Tamil family drama, OTT", v: 78, trend: "+12" },
  { k: "Hindi dub demand (South titles)", v: 71, trend: "+9" },
  { k: "Small-town nostalgia", v: 64, trend: "+4" },
  { k: "Heist / thriller", v: 82, trend: "−6 saturated" },
];

export const IP_LEADS = [
  { title: "The Salt Merchant's Daughter", kind: "Novel, 1971", rights: "Open", status: "ok" },
  { title: "Kolam Contests of Thanjavur", kind: "Article, 2019", rights: "Inspiration only", status: "idle" },
  { title: "Notes from a Ferry Log", kind: "Memoir, 2008", rights: "Optioned to another studio", status: "risk" },
];

export const BEATS = {
  first: [
    { sc: "1–6", t: "Paati enters the contest, posts a single photo" },
    { sc: "7–19", t: "Nila (Chennai) and Divya (Pune) both see it" },
    { sc: "20–38", t: "Sisters arrive a day apart; the house is cold" },
    { sc: "39–60", t: "Practice at dawn, old fights resurface" },
  ],
  interval: { sc: 61, t: "Paati's kolam is the floor plan of the sold land" },
  second: [
    { sc: "62–78", t: "Searching the land records" },
    { sc: "79–94", t: "Ravi's deal unravels" },
    { sc: "95–106", t: "Contest morning, the rain" },
    { sc: "107–112", t: "Three generations draw one kolam" },
  ],
};

export const CHARACTERS = [
  { id: "paati", name: "Paati", role: "Grandmother", arc: 90, x: 50, y: 18 },
  { id: "nila", name: "Nila", role: "Elder sister, architect", arc: 75, x: 18, y: 55 },
  { id: "divya", name: "Divya", role: "Younger sister, Pune", arc: 70, x: 82, y: 55 },
  { id: "ravi", name: "Ravi", role: "Cousin, wants to sell", arc: 60, x: 50, y: 62 },
  { id: "kabir", name: "Kabir", role: "Divya's husband, Hindi", arc: 45, x: 88, y: 88 },
  { id: "murugan", name: "Murugan", role: "Neighbour, contest judge", arc: 35, x: 14, y: 90 },
];

export const RELATIONS: [string, string, string][] = [
  ["paati", "nila", "raised her"],
  ["paati", "divya", "favourite"],
  ["nila", "divya", "estranged"],
  ["ravi", "paati", "grandson"],
  ["ravi", "nila", "rivals"],
  ["divya", "kabir", "married"],
  ["murugan", "paati", "old flame"],
  ["kabir", "ravi", "deal"],
  ["murugan", "nila", "mentor"],
];

export const VERSION_LADDER = [
  { k: "Logline", by: "Writer + Producer", on: "18 Jun" },
  { k: "Synopsis", by: "Writer", on: "4 Jul" },
  { k: "Treatment", by: "Writer + Director", on: "22 Jul" },
  { k: "One-line order", by: "Director", on: "26 Jul" },
  { k: "Scene order", by: "Director + Producer", on: "29 Jul" },
];

export const DRAFTS = [
  { k: "D1", on: "6 Aug", colour: "#c9ced8", label: "White" },
  { k: "D2", on: "14 Aug", colour: "#c9ced8", label: "White" },
  { k: "D3", on: "21 Aug", colour: "#c9ced8", label: "White" },
  { k: "D4", on: "27 Aug", colour: "#c9ced8", label: "White" },
  { k: "D5", on: "2 Sep", colour: "#c9ced8", label: "Locked" },
  { k: "Rev", on: "9 Oct", colour: "#8fb8ff", label: "Blue pages" },
  { k: "Rev", on: "17 Oct", colour: "#ff9fc4", label: "Pink pages" },
];

export const COVERAGE = [
  { k: "Structure", v: [62, 70, 74, 80, 85] },
  { k: "Pacing", v: [55, 58, 61, 77, 82] },
  { k: "Character", v: [70, 78, 84, 86, 88] },
  { k: "Dialogue", v: [66, 72, 75, 79, 83] },
];

export const NOTES = [
  { id: "n1", from: "Coverage Agent", text: "Second half sags sc 79–90; Ravi's deal resolves off-screen.", state: "accepted" as const, ai: true },
  { id: "n2", from: "Dialogue Agent", text: "Kabir's Hindi line in sc 52 reads too formal for a husband.", state: "open" as const, ai: true },
  { id: "n3", from: "Director", text: "Can Paati say less in sc 61? Let the kolam speak.", state: "open" as const, ai: false },
  { id: "n4", from: "Dialogue Agent", text: "Nila repeats 'this house' 7 times in sc 20–38.", state: "rejected" as const, ai: true },
];

export const TABLE_READ = [
  { sc: 14, t: "Kitchen, dawn", secs: 96, flag: false },
  { sc: 27, t: "Station, night", secs: 142, flag: true },
  { sc: 44, t: "Terrace argument", secs: 188, flag: false },
  { sc: 61, t: "The kolam reveal", secs: 121, flag: false },
  { sc: 83, t: "Land office", secs: 210, flag: true },
];

export const LEDGER = [
  { v: "Revision, pink pages", by: "Meenakshi R.", at: "17 Oct 2026, 19:02", hash: "9f3a…c71e" },
  { v: "Draft 5 (locked)", by: "Meenakshi R., Joel T.", at: "2 Sep 2026, 18:40", hash: "1b07…ae42" },
  { v: "Story Bible, characters", by: "Meenakshi R.", at: "26 Jul 2026, 11:15", hash: "c4d9…02bb" },
  { v: "Treatment v3", by: "Meenakshi R.", at: "22 Jul 2026, 09:12", hash: "77e0…5f19" },
  { v: "Idea Card, voice note", by: "Meenakshi R.", at: "14 Jun 2026, 22:31", hash: "e812…9a60" },
];

export const REGISTRATIONS = [
  { body: "SWA (India)", state: "Confirmed", chip: "ok", ref: "SWA-2026-118204" },
  { body: "WGA West", state: "Filed", chip: "info", ref: "Filed 12 Sep" },
  { body: "WGGB", state: "Not needed", chip: "idle", ref: "—" },
];

export const CREDITS = [
  { credit: "Story by", who: "Meenakshi R.", signed: true },
  { credit: "Screenplay by", who: "Meenakshi R. & Joel T.", signed: true },
  { credit: "Dialogue (Hindi)", who: "Joel T.", signed: true },
];

export const CONTRACTS = [
  { k: "Writer agreement, Meenakshi R.", state: "Signed" },
  { k: "Writer agreement, Joel T.", state: "Signed" },
  { k: "NDA, core team (11)", state: "Signed" },
  { k: "NDA, location scout 04", state: "Sent" },
];

export const SHARE_LOG = [
  { who: "Arjun V. (Director)", when: "Today 08:12", nda: "NDA-002" },
  { who: "Farah S. (Costume HOD)", when: "Yesterday 18:40", nda: "NDA-009" },
  { who: "loc-scout-04", when: "19 Oct 21:14", nda: "Missing" },
  { who: "Northstar Pictures", when: "15 Oct 10:02", nda: "NDA-011" },
];

export type FundLane = "contacted" | "reviewing" | "negotiating" | "committed";
export const FUNDERS: { id: string; name: string; kind: string; lane: FundLane; amtCr: number }[] = [
  { id: "f1", name: "Northstar Pictures", kind: "Equity", lane: "committed", amtCr: 6.2 },
  { id: "f2", name: "TN Film Incentive", kind: "State incentive", lane: "committed", amtCr: 2.1 },
  { id: "f3", name: "StreamBay OTT", kind: "Pre-sale", lane: "committed", amtCr: 4.0 },
  { id: "f4", name: "Kaveri Capital", kind: "Gap", lane: "committed", amtCr: 2.3 },
  { id: "f7", name: "Malabar Studios", kind: "Co-producer", lane: "negotiating", amtCr: 1.5 },
  { id: "f5", name: "Indie Fund Asia", kind: "Grant", lane: "reviewing", amtCr: 0.6 },
  { id: "f6", name: "Lotus Media", kind: "Co-producer", lane: "contacted", amtCr: 3.0 },
];

export const PITCH_ANALYTICS = [
  { who: "Kaveri Capital", opens: 5, mins: 22, top: "Budget, Lookbook" },
  { who: "Indie Fund Asia", opens: 2, mins: 9, top: "Director's note" },
  { who: "Lotus Media", opens: 1, mins: 3, top: "Cover" },
];

export const INCENTIVES = [
  { k: "Tamil Nadu regional film incentive", v: "Up to ₹2.1 Cr", deadline: "Claimed", state: "ok" },
  { k: "Kerala location rebate (2 days)", v: "₹18L", deadline: "15 Nov", state: "warn" },
  { k: "NFDC co-production fund", v: "₹50L", deadline: "30 Nov", state: "info" },
];

export const READINESS = [
  { k: "Casting", v: 67 },
  { k: "Locations", v: 82 },
  { k: "Storyboards", v: 61 },
  { k: "Costume", v: 78 },
  { k: "Budget", v: 96 },
  { k: "Crew", v: 92 },
  { k: "Art / props", v: 70 },
  { k: "Permits", v: 80 },
];

export type StripKind = "int-day" | "ext-day" | "night";
export interface Strip {
  id: string;
  sc: number;
  set: string;
  kind: StripKind;
  cast: string[];
  costL: number;
}

export const STRIPS: Record<string, Strip[]> = {
  "Day 1": [
    { id: "s14", sc: 14, set: "Paati's kitchen", kind: "int-day", cast: ["Paati", "Nila"], costL: 3.1 },
    { id: "s15", sc: 15, set: "Paati's kitchen", kind: "int-day", cast: ["Paati", "Divya"], costL: 2.6 },
  ],
  "Day 2": [
    { id: "s3", sc: 3, set: "Temple street", kind: "ext-day", cast: ["Paati", "Murugan"], costL: 5.4 },
    { id: "s4", sc: 4, set: "Temple street", kind: "ext-day", cast: ["Paati"], costL: 2.2 },
  ],
  "Day 3": [
    { id: "s27", sc: 27, set: "Railway station", kind: "night", cast: ["Divya", "Kabir"], costL: 6.8 },
  ],
  "Day 4": [
    { id: "s61", sc: 61, set: "Courtyard", kind: "ext-day", cast: ["Paati", "Nila", "Divya", "Ravi"], costL: 7.9 },
    { id: "s62", sc: 62, set: "Courtyard", kind: "int-day", cast: ["Nila", "Ravi"], costL: 2.4 },
  ],
  "Day 5": [
    { id: "s44", sc: 44, set: "Terrace", kind: "night", cast: ["Nila", "Divya"], costL: 4.3 },
    { id: "s83", sc: 83, set: "Land office", kind: "int-day", cast: ["Ravi", "Kabir"], costL: 3.0 },
  ],
};

export const CASTING = [
  { role: "Paati", actors: [{ n: "[Actor A]", look: 92, state: "Cast" }], avail: "Held 38/38 days" },
  { role: "Nila", actors: [{ n: "[Actor B]", look: 88, state: "Look-test" }, { n: "[Actor C]", look: 84, state: "Look-test" }, { n: "[Actor D]", look: 79, state: "Look-test" }], avail: "B: 34/38, C: 38/38, D: 30/38" },
  { role: "Divya", actors: [{ n: "[Actor E]", look: 90, state: "Cast" }], avail: "Held 29/29 days" },
  { role: "Ravi", actors: [{ n: "[Actor F]", look: 81, state: "Look-test" }, { n: "[Actor G]", look: 77, state: "Look-test" }], avail: "F: 22/22, G: 18/22" },
  { role: "Kabir", actors: [{ n: "[Actor H]", look: 86, state: "Cast" }], avail: "Held 11/11 days" },
  { role: "Murugan", actors: [{ n: "[Actor J]", look: 89, state: "Cast" }], avail: "Held 14/14 days" },
];

export const LOCATIONS = [
  { id: "l1", name: "Paati's house", x: 46, y: 44, recce: "Locked", permit: "Not needed", scenes: 41 },
  { id: "l2", name: "Sarangapani temple street", x: 58, y: 30, recce: "Recce done", permit: "Pending, 28 Oct", scenes: 12 },
  { id: "l3", name: "Mahamaham tank", x: 70, y: 52, recce: "Locked", permit: "Granted", scenes: 6 },
  { id: "l4", name: "Railway station", x: 28, y: 22, recce: "Locked", permit: "Granted", scenes: 4 },
  { id: "l5", name: "Land records office", x: 34, y: 70, recce: "Recce booked", permit: "Pending, 2 Nov", scenes: 5 },
  { id: "l6", name: "Cauvery ghat", x: 78, y: 78, recce: "Locked", permit: "Granted", scenes: 7 },
];

export const BUDGET_DEPTS = [
  { k: "Cast", base: 3.4, est: 3.3 },
  { k: "Crew", base: 2.6, est: 2.6 },
  { k: "Locations", base: 1.2, est: 1.1 },
  { k: "Art & costume", base: 1.5, est: 1.6 },
  { k: "Camera & light", base: 1.9, est: 1.85 },
  { k: "VFX", base: 0.335, est: 0.382 },
  { k: "Post & music", base: 2.2, est: 2.2 },
];

export const SHOTS = { notStarted: 236, inProgress: 41, inReview: 18, approved: 0 };

export const DEPT_PIPE = [
  { k: "Modeling", waiting: 3 },
  { k: "Rigging", waiting: 1 },
  { k: "Animation", waiting: 2 },
  { k: "Lighting", waiting: 7 },
  { k: "Render", waiting: 2 },
];

export const BURN = [0, 4.1, 8.3, 12.0, 16.4, 20.2, 24.9, 29.1, 33.6, 37.8, 42.9, 47.0];
export const BURN_PLAN = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44];

export const CUTS = [
  { v: "Assembly", len: "2h 54m", on: "Wk 1", by: "Edit Assist Agent", state: "AI draft" },
  { v: "Director's cut v2", len: "2h 22m", on: "Wk 4", by: "Editor + Director", state: "Notes" },
  { v: "Cut v5", len: "2h 09m", on: "Wk 7", by: "Editor", state: "In review" },
];

export const POST_MILESTONES = [
  { k: "Picture edit", due: "Wk 8", state: "info" },
  { k: "VFX", due: "Wk 9", state: "warn" },
  { k: "Colour", due: "Wk 10", state: "idle" },
  { k: "Sound & music", due: "Wk 11", state: "idle" },
];

export const LANGS = [
  { k: "Tamil (original)", subs: "ok", dub: "—", review: "ok" },
  { k: "Hindi", subs: "ok", dub: "ai", review: "warn" },
  { k: "English", subs: "ok", dub: "—", review: "ok" },
  { k: "Telugu", subs: "info", dub: "idle", review: "idle" },
  { k: "Malayalam", subs: "idle", dub: "idle", review: "idle" },
];

export const POST_RIGHTS = [
  { k: "'Margazhi Thingal' (traditional, re-recorded)", state: "Cleared" },
  { k: "Stock drone, Cauvery delta", state: "Cleared" },
  { k: "Temple nadaswaram recording", state: "Pending" },
];

export const DELIVERY = [
  { buyer: "StreamBay OTT", pass: 38, total: 41 },
  { buyer: "Theatrical DCP", pass: 22, total: 22 },
  { buyer: "Satellite TV", pass: 15, total: 19 },
];

export const RELEASE_WINDOWS = [
  { k: "Festival, IFFK", from: 0, to: 1, kind: "fest" },
  { k: "Festival, Busan market", from: 1, to: 2, kind: "fest" },
  { k: "Theatrical, India", from: 3, to: 5, kind: "theatre" },
  { k: "Theatrical, Gulf", from: 3, to: 4, kind: "theatre" },
  { k: "OTT, StreamBay", from: 5, to: 11, kind: "ott" },
  { k: "Satellite TV", from: 8, to: 12, kind: "tv" },
];

export const TERRITORIES = [
  { k: "India", state: "Sold" },
  { k: "Gulf", state: "In talks" },
  { k: "Singapore & Malaysia", state: "Sold" },
  { k: "Sri Lanka", state: "In talks" },
  { k: "North America", state: "Open" },
  { k: "UK & Europe", state: "Open" },
  { k: "Australia & NZ", state: "Open" },
  { k: "Rest of world", state: "Open" },
];

export const IP_PIPELINE = [
  { k: "Telugu remake", note: "Strong regional fit, score 81", state: "Sent to Ideate" },
  { k: "Kolam (series), 6 eps", note: "Paati's earlier contests, 1970s", state: "Exploring" },
  { k: "Kids' animated short", note: "The kolam that came alive", state: "Idea" },
];

/* audit seed */
export const AUDIT_SEED = [
  { t: "10:48", actor: "Storyboard Agent", kind: "agent" as const, action: "drafted", target: "Boards sc 18–19 (AI-made)" },
  { t: "10:31", actor: "Continuity Guardian", kind: "agent" as const, action: "flagged", target: "Costume mismatch 18-2 / 19-1" },
  { t: "09:58", actor: "Revathi K. (Producer)", kind: "person" as const, action: "accepted", target: "Crew shortlist, sound dept" },
  { t: "09:12", actor: "Crew Agent", kind: "agent" as const, action: "suggested", target: "3 boom operators" },
  { t: "Yesterday", actor: "Arjun V. (Director)", kind: "person" as const, action: "approved", target: "Boards sc 1–11" },
];

export const BRAIN_SECTIONS = [
  { k: "Ideas", n: 17, by: "Idea Capture, Premise Scorer" },
  { k: "Story Bible", n: 84, by: "World Builder, Character Architect" },
  { k: "Script versions", n: 31, by: "Script Format, Authorship" },
  { k: "Characters & locations", n: 16, by: "Character Architect, Location" },
  { k: "Budget lines", n: 412, by: "Top-Sheet, Budget" },
  { k: "Schedule strips", n: 112, by: "Scheduling" },
  { k: "Assets", n: 1264, by: "Storyboard, Visual Dev" },
  { k: "Contracts", n: 27, by: "Contract, Deal Room" },
  { k: "Approvals", n: 203, by: "People only" },
];
