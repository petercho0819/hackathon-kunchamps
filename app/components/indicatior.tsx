"use client";

import dynamic from "next/dynamic";
import loadingAni from "./loading-lottie.json";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const LazyLottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LoadingIndicator({
  className,
  comment,
}: {
  className?: string;
  comment?: string;
}) {
  return (
    <div className="fixed flex-col space-y-3 left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <LazyLottie
        className={cn("size-8 stroke-white/30", className)}
        animationData={loadingAni}
      />
      {comment && <p>{comment}</p>}
    </div>
  );
}

export function LoadingIndicator2({
  className,
  comment,
}: {
  className?: string;
  comment?: string;
}) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const dotCount = (time % 3) + 1;

  return (
    <div className="fixed flex-col space-y-3 left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <span
        className={cn(
          "size-8 rounded-full border-t-3 border-t-black border-r-3 border-r-transparent inline-block animate-spin",
          className,
        )}
      />
      {comment && (
        <>
          <p>
            {comment}
            {dotCount === 1 ? "." : dotCount === 2 ? ".." : "..."}
          </p>
          <p>{time > 10 ? "거의 다 완성 돼가요..." : ""}</p>
        </>
      )}
    </div>
  );
}
