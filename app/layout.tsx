import "@/style/globals.css";

import { Inter } from "next/font/google";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
import Providers from "@/app/query-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assistants API Quickstart",
  description: "A quickstart template using the Assistants API with OpenAI",
  icons: {
    icon: "/openai.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="size-full">
      <body className={cn(inter.className, "size-full")}>
        <Providers>{assistantId ? children : <Warnings />}</Providers>

        {/* <Link href="/"> */}
        {/*   <img */}
        {/*     className="size-8 absolute m-4 top-0 right-0" */}
        {/*     src="/openai.svg" */}
        {/*     alt="OpenAI Logo" */}
        {/*   /> */}
        {/* </Link> */}
      </body>
    </html>
  );
}
