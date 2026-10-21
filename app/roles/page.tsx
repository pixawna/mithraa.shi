import type { Metadata } from "next";
import { Roles } from "@/components/pages/Roles";

export const metadata: Metadata = { title: "Role screens" };

export default function Page() {
  return <Roles />;
}
