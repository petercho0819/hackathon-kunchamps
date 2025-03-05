import React from "react";
import Chat from "../../components/chat";
import ChatContainer from "@/app/dashboard/chat/chat-container";
import { openai } from "@/app/utils/ai-providers";
import { getS3Url } from "@/app/actions/s3";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    imageId: string;
    threadId: string;
    avatarImageKey: string;
    bgImageKey: string;
  }>;
}) {
  const {
    imageId, // character와 동일 값
    threadId,
    avatarImageKey,
    bgImageKey,
  } = await searchParams;

  const { data } = await openai.beta.threads.messages.list(threadId);

  const prevMessages = data
    .filter(({ metadata }) => metadata?.role !== "system")
    .flatMap(({ content, role }) =>
      content
        .filter(({ type }) => type === "text")
        .map((content) => ({
          role: role,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          text: content.text.value,
        })),
    )
    .reverse();

  return (
    <main className="size-full flex items-center justify-center">
      <div className="size-full max-w-[1000px]">
        <ChatContainer
          backgroundImageUri={getS3Url(bgImageKey)}
          avatarUri={getS3Url(avatarImageKey)}
        >
          <Chat
            threadId={threadId}
            imageId={imageId}
            messageHistory={prevMessages}
          />
        </ChatContainer>
      </div>
    </main>
  );
}
