import type { Scene } from "@/components/media/Still";

/**
 * A tiny, deterministic stand-in for the Stage 1 agents. It reads the person's
 * spark and produces the same kinds of outputs the real agents write to the
 * Project Brain: an Idea Card, market notes, a score card and an IP check.
 */

const STOP = new Set("a an the of to and in on at for with his her their its is are was were be who what when where one last his her into from that this by as about".split(" "));

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const titleCase = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export interface IdeaResult {
  title: string;
  logline: string;
  genre: string;
  tone: string[];
  language: string;
  scene: Scene;
  market: { k: string; v: number; note: string }[];
  scores: { k: string; v: number; why: string }[];
  ip: { source: string; status: "clear" | "check"; note: string };
  overall: number;
}

const SCENES: [RegExp, Scene][] = [
  [/\b(ferry|boat|sea|bridge|island|fisher)/i, "ferry"],
  [/\b(temple|festival|priest|gopuram)/i, "temple-street"],
  [/\b(train|station|railway|platform)/i, "station-night"],
  [/\b(market|flower|jasmine|bazaar)/i, "market"],
  [/\b(river|ghat|cauvery|ganga)/i, "river-ghat"],
  [/\b(space|rocket|astronaut|orbit|moon)/i, "orbit"],
  [/\b(radio|fm|broadcast)/i, "radio"],
  [/\b(salt|pan|desert)/i, "salt"],
  [/\b(kitchen|cook|recipe|food|mother|amma|grand)/i, "kitchen"],
  [/\b(terrace|night|stars|roof)/i, "terrace-night"],
  [/\b(land|record|office|court|deed)/i, "land-office"],
  [/\b(kolam|rangoli|drawing)/i, "kolam"],
];

const GENRES: [RegExp, string, string[]][] = [
  [/\b(heist|crime|police|murder|gang|thief)/i, "Crime thriller", ["Tense", "Night-lit"]],
  [/\b(ghost|haunt|curse|spirit)/i, "Horror", ["Eerie", "Slow-burn"]],
  [/\b(love|romance|wedding|marry)/i, "Romance", ["Warm", "Bittersweet"]],
  [/\b(space|rocket|future|robot|ai\b)/i, "Sci-fi drama", ["Wonder", "Grounded"]],
  [/\b(war|army|soldier|border)/i, "War drama", ["Stark", "Epic"]],
  [/\b(mother|father|daughter|son|sister|brother|grand|family|amma|appa|paati|thatha)/i, "Family drama", ["Warm", "Nostalgic"]],
  [/\b(comedy|funny|prank)/i, "Comedy", ["Light", "Chaotic"]],
];

export function runIdeaAgents(spark: string): IdeaResult {
  const text = spark.trim() || "A ferry pilot's last week before the new bridge to Rameswaram opens.";
  const h = hash(text);
  const words = text.replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter(Boolean);
  const keys = words.filter((w) => !STOP.has(w.toLowerCase()) && w.length > 3);

  const scene = SCENES.find(([re]) => re.test(text))?.[1] ?? "dawn-courtyard";
  const [, genre, tone] = GENRES.find(([re]) => re.test(text)) ?? [null, "Drama", ["Intimate", "Hopeful"]];

  // Title: two strongest words, or a known pattern.
  let title = keys.slice(0, 2).map(titleCase).join(" ") || "Untitled";
  if (/ferry|bridge/i.test(text)) title = "Last Crossing";
  else if (/radio/i.test(text)) title = "Night Frequency";
  else if (/kolam/i.test(text)) title = "One Line";
  else if (keys.length >= 1 && keys[0].length > 8) title = titleCase(keys[0]);

  let logline = text.replace(/\s+/g, " ");
  if (!/[.!?]$/.test(logline)) logline += ".";
  logline = logline.charAt(0).toUpperCase() + logline.slice(1);

  const r = (k: number, lo: number, hi: number) => lo + ((h >> k) % (hi - lo + 1));
  const scores = [
    { k: "Originality", v: r(1, 66, 92), why: "No close match among 2,400 recent South Indian releases." },
    { k: "Audience fit", v: r(4, 70, 94), why: `${genre} is over-indexing on OTT in Tamil and Malayalam.` },
    { k: "Budget band", v: r(7, 62, 90), why: "Few locations, small cast; fits a ₹8–15 Cr band." },
    { k: "Franchise", v: r(10, 38, 76), why: "Strong world, limited sequel hooks; better as a remake prospect." },
  ];
  const overall = Math.round(scores.reduce((s, x) => s + x.v, 0) / scores.length);

  const market = [
    { k: `${genre}, Tamil OTT`, v: r(3, 62, 88), note: "+11% watch time this quarter" },
    { k: "Hindi dub demand", v: r(5, 55, 80), note: "South titles up for 6 straight months" },
    { k: "Similar titles in 12 months", v: r(8, 18, 46), note: "Low saturation" },
  ];

  const book = /book|novel|story by|memoir|based on/i.test(text);
  const ip = book
    ? { source: "Adapted work", status: "check" as const, note: "Source rights need a check before Gate 1." }
    : { source: "Original idea", status: "clear" as const, note: "No source rights needed. Authorship stamped to you." };

  const language = /hindi/i.test(text) ? "Hindi" : /malayalam/i.test(text) ? "Malayalam" : /telugu/i.test(text) ? "Telugu" : "Tamil";

  return { title, logline, genre, tone, language, scene, market, scores, ip, overall };
}

export const EXAMPLES = [
  { k: "Voice note", text: "A ferry pilot's last week before the new bridge to Rameswaram opens. His daughter wants him to retire; he wants one more crossing." },
  { k: "One line", text: "A grandfather's pirate FM station becomes the only voice a flooded town can hear." },
  { k: "News clipping", text: "Night-shift jasmine sellers in Madurai market find a ledger that could bring down the flower mafia." },
  { k: "Book", text: "Based on the 1971 novel The Salt Merchant's Daughter: a girl inherits a failing salt pan and her father's debts." },
];
