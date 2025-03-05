import type { PropsWithChildren } from "react";
import React from "react";

export default async function StudyLayout({ children }: PropsWithChildren) {
  return (
    <div className="size-full flex justify-center items-center">{children}</div>
  );
}
