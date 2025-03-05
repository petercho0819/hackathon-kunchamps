import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/ai-providers";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request, props) {
  const params = await props.params;

  const { threadId } = params;

  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}
