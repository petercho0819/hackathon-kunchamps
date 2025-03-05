import type { PropsWithChildren } from "react";
import React, { Suspense } from "react";

export default async function StudyLayout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <div className="size-full flex justify-center items-center">
        {children}
      </div>
    </Suspense>
  );
}
