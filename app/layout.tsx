import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { BrainProvider } from "@/components/brain/BrainProvider";
import { AppSidebar } from "@/components/shell/Topbar";
import { Toast } from "@/components/shell/Toast";
import "./globals.css";

// Same pairing as Higgsfield: Space Grotesk for uppercase headings, Inter for everything else.
const title = Space_Grotesk({ variable: "--font-title", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "mithraa.SHI", template: "%s | mithraa.SHI" },
  description: "The studio where agents make films with you: from a voice note to release, with your team signing every gate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${title.variable} ${body.variable} h-full`}>
      <body className="min-h-full">
        <BrainProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <Suspense fallback={<div className="lg:w-[248px]" />}>
              <AppSidebar />
            </Suspense>
            <main className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col gap-8 px-4 py-6 md:px-8 lg:py-8">{children}</main>
          </div>
          <Toast />
        </BrainProvider>
      </body>
    </html>
  );
}
