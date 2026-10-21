"use client";

import { useState } from "react";

/**
 * Photo slots. Every image in the prototype loads a real still from
 * `public/media/<scene>.jpg`. Until that file exists, the slot shows a quiet
 * cinematic gradient in the same mood, so the layout never looks broken.
 * See public/media/README.md for the list of filenames.
 */
export type Scene =
  | "dawn-courtyard"
  | "temple-street"
  | "station-night"
  | "terrace-night"
  | "river-ghat"
  | "kitchen"
  | "kolam"
  | "market"
  | "ferry"
  | "orbit"
  | "radio"
  | "land-office"
  | "salt";

/** Mood per slot: [shadow, mid, light-source colour, light position]. */
const MOOD: Record<Scene, [string, string, string, string]> = {
  "dawn-courtyard": ["#1a1416", "#4a2a33", "#f0a36b", "72% 70%"],
  "temple-street": ["#1b120e", "#4b2617", "#f2954a", "50% 40%"],
  "station-night": ["#07090f", "#13213a", "#e9c27a", "30% 35%"],
  "terrace-night": ["#06070d", "#151a35", "#c9c6ff", "80% 18%"],
  "river-ghat": ["#1b252d", "#4d6676", "#f3dcc0", "30% 55%"],
  kitchen: ["#120a06", "#3e2412", "#ffc27a", "70% 30%"],
  kolam: ["#141210", "#2c2620", "#efe6d6", "50% 50%"],
  market: ["#0b0612", "#33163d", "#ffcf6a", "60% 30%"],
  ferry: ["#0b1a29", "#23506b", "#f2b27a", "78% 62%"],
  orbit: ["#020208", "#141236", "#9db8ff", "60% 30%"],
  radio: ["#160a14", "#5b2440", "#f08a4b", "30% 60%"],
  "land-office": ["#12110d", "#2c2a22", "#f1e3b0", "75% 25%"],
  salt: ["#5d6f78", "#b9b2a6", "#fff6ea", "50% 30%"],
};

export function Still({
  scene,
  className = "",
  label,
  aspect: _aspect,
}: {
  scene: Scene;
  className?: string;
  label?: string;
  letterbox?: boolean;
  grain?: boolean;
  aspect?: "wide" | "poster" | "square";
}) {
  void _aspect;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [a, b, light, pos] = MOOD[scene];
  return (
    <div
      className={`media-fill relative h-full w-full ${className}`}
      style={{
        background: `radial-gradient(120% 90% at ${pos}, ${light}55 0%, ${b} 38%, ${a} 78%), linear-gradient(180deg, ${b}, ${a})`,
      }}
      role="img"
      aria-label={label ?? scene.replace("-", " ")}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied stills, any size
        <img
          src={`/media/${scene}.jpg`}
          alt=""
          ref={(el) => {
            // the request may finish before hydration, so check the element directly
            if (el?.complete) {
              if (el.naturalWidth > 0) setLoaded(true);
              else setFailed(true);
            }
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

/** Title overlay for poster slots. */
export function PosterTitle({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="media-label flex flex-col items-center gap-1 text-center">
      <span className="display text-[34px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">{title}</span>
      {tag && <span className="text-[10.5px] font-semibold tracking-[0.18em] text-white/80">{tag}</span>}
    </div>
  );
}

export const MEDIA_SLOTS = Object.keys(MOOD) as Scene[];
