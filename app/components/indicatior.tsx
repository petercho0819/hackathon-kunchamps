"use client";

import dynamic from "next/dynamic";
import loadingAni from "./loading-lottie.json";
import drawLoadingAni from "./draw-loading.json";
import { cn } from "@/lib/utils";
import { Suspense, useEffect, useState } from "react";

const LazyLottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="size-72" />,
});

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

export function LoadingIndicator2({ className }: { className?: string }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const dotCount = (time % 3) + 1;

  const loadingDot = dotCount === 1 ? "." : dotCount === 2 ? ".." : "...";

  const comment =
    time < 10
      ? "환경을 구성 중이에요"
      : time < 18
        ? "배경을 그리고 있어요"
        : time < 26
          ? "페르소나를 만들고 있어요"
          : "거의 다 완성 돼가요";

  return (
    <div className="fixed flex-col space-y-3 left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <div className="absolute flex flex-col items-center justify-center">
        <LazyLottie
          className={cn("size-72", className)}
          animationData={drawLoadingAni}
        />
        <p className="absolute z-10 bottom-5">
          {comment}
          {loadingDot}
        </p>
      </div>
    </div>
  );
}
