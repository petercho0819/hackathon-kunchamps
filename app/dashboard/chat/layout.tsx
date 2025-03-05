import type { PropsWithChildren } from "react";
import React from "react";

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <main className="size-full flex items-center justify-center">
      {children}
    </main>
  );
}
