import { openai } from "@/app/utils/ai-providers";

export const getMessagesHistory = async (threadId) => {
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

  return prevMessages;
};
