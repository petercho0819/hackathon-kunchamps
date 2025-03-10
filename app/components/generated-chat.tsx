"use client";

import { s3BaseUrl as S3_BASE_URL } from "@/constants";
import Chat from "@/app/components/chat";
import { LoadingIndicator2 } from "@/app/components/indicatior";
import ChatContainer from "@/app/dashboard/chat/chat-container";
import apiAxios from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const GeneratedChat = ({ place, character, level, role }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", { place, character, level, role }],
    queryFn: async () => {
      const { data } = await apiAxios.post("/generate", {
        place,
        character,
        level,
        role,
      });
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  if (isLoading || !data) {
    return <LoadingIndicator2 />;
  }

  const { bgImageKey, avatarImageKey, threadId } = data;

  return (
    <main className="size-full flex items-center justify-center bg-black">
      <div className="size-full flex items-center justify-center">
        <div className="size-full max-w-[1000px]">
          <ChatContainer
            backgroundImageUri={getS3Url(bgImageKey)}
            avatarUri={getS3Url(avatarImageKey)}
          >
            <Chat threadId={threadId} imageId={character} />
          </ChatContainer>
        </div>
      </div>
    </main>
  );
};

function getS3Url(key: string) {
  return `${S3_BASE_URL}/${key}.png`;
}
