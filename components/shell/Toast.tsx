"use client";

import { useBrain } from "@/components/brain/BrainProvider";

export function Toast() {
  const { toast } = useBrain();
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-50 max-w-[380px]">
      {toast && (
        <div className="rounded-xl border border-[var(--line-2)] bg-[var(--raised)] px-4 py-3 text-[13px] shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
