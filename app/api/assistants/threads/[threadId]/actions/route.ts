import { openai } from "@/app/ai-providers";

// Send a new message to a thread
export async function POST(request, props) {
  const params = await props.params;

  const { threadId } = params;

  const { toolCallOutputs, runId } = await request.json();

  const stream = openai.beta.threads.runs.submitToolOutputsStream(
    threadId,
    runId,
    // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
    { tool_outputs: toolCallOutputs },
  );

  return new Response(stream.toReadableStream());
}
