import type { Metadata } from "next";
import { Agents } from "@/components/pages/Agents";

export const metadata: Metadata = { title: "Agents" };

export default function Page() {
  return <Agents />;
}
