import type { Metadata } from "next";
import { PipelineMap } from "@/components/pages/PipelineMap";

export const metadata: Metadata = { title: "Agent pipeline" };

export default function Page() {
  return <PipelineMap />;
}
