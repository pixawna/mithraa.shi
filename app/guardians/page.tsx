import type { Metadata } from "next";
import { Guardians } from "@/components/pages/Guardians";

export const metadata: Metadata = { title: "Guardians" };

export default function Page() {
  return <Guardians />;
}
