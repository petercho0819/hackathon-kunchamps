"use client";

import { coreGeneratingSituation } from "@/app/actions/core-generator";
import { LoadingIndicator2 } from "@/app/components/indicatior";
import { Character, Place } from "@/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      // 이미지 생성후에 query와 함께 챗방으로 이동
      const character = searchParams.get("character") as Character;
      const place = searchParams.get("place") as Place;
      const level = searchParams.get("level");
      const role = searchParams.get("level");

      const params = new URLSearchParams();
      params.set("imageId", character);

      const { bgImageKey, avatarImageKey, threadId } =
        await coreGeneratingSituation({
          character,
          place,
          level: +level,
          role,
        });
      //
      params.set("bgImageKey", bgImageKey);
      params.set("avatarImageKey", avatarImageKey);
      params.set("threadId", threadId);

      router.push(`/dashboard/chat?${params.toString()}`);
    })().catch(console.error);
  }, [router, searchParams]);

  return <LoadingIndicator2 />;
}
