import type { Metadata } from "next";
import { Brain } from "@/components/pages/Brain";

export const metadata: Metadata = { title: "Project Brain" };

export default function Page() {
  return <Brain />;
}
