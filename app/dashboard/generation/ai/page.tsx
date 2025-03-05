"use client";

import {
  generateBetterPrompt,
  selectOnePrompt,
} from "@/app/actions/better-prompt-ai";
import { generateCharacterAIAsset } from "@/app/actions/character-ai";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Character, characterInfoMap, Place, placeInfoMap } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function GenerationPage() {
  const searchParams = useSearchParams();

  const imageId = searchParams.get("imageId") as Character;
  const placeId = searchParams.get("placeId") as Place;

  const [prompt, setPrompt] = useState(
    `
롤 플레잉 게임에서 주어진 상황과 역할에 알맞게 이미지 생성해줘
- 상황: ${placeInfoMap[placeId].situation}
- 장소: ${placeInfoMap[placeId].place}
- 역할: ${placeInfoMap[placeId].assistantRole}
- 성별: ${characterInfoMap[imageId].gender}

그리고 무릎위로 는 인물이 다 그려져야해
`.trim(),
  );

  const [result, setResult] = useState("");

  const [selectedPrompt, setSelectedPrompt] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const mutationFirst = useMutation({
    mutationFn: async () => {
      return await generateBetterPrompt({ myPrompt: prompt });
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = async () => {
    mutationFirst.mutate();
  };

  const mutationSecond = useMutation({
    mutationFn: async () => {
      return await selectOnePrompt({ betterPrompt: result });
    },
    onSuccess: (data) => {
      setSelectedPrompt(data);
    },
  });

  const handleSelectPrompt = async () => {
    mutationSecond.mutate();
  };

  const mutationThird = useMutation({
    mutationFn: async () => {
      return await generateCharacterAIAsset({
        character: imageId,
        prompt: selectedPrompt,
        place: placeId,
      });
    },
  });

  return (
    <div className="h-dvh px-10 grid gap-2 overflow-auto">
      <h1>프롬프트 입력</h1>
      <h2>이미지 생성을위한 프롬프트를 생성합니다.</h2>
      <Textarea
        value={prompt}
        onChange={handleChange}
        className="h-40 w-2xl"
        placeholder="instructions"
      />

      <Button loading={mutationFirst.isPending} onClick={handleSubmit}>
        생성하기
      </Button>

      <Textarea className="h-96 w-2xl" value={result} disabled />

      <Separator className="m-4" />

      <h1>위 생성된거 참고해서 프롬프트 한개 재생성</h1>

      <Button loading={mutationSecond.isPending} onClick={handleSelectPrompt}>
        생성하기
      </Button>
      <Textarea className="h-96 w-2xl" value={selectedPrompt} disabled />

      <Separator className="m-4" />

      <h1>위 프롬프트로 이미지 생성하기! 아직 버그 있음...</h1>
      <Button
        loading={mutationThird.isPending}
        disabled
        onClick={() => {
          mutationThird.mutate();
        }}
      >
        생성하기
      </Button>
    </div>
  );
}
