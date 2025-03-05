import { openai } from "@/app/ai-providers";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// edit assistant
export async function POST(request: NextRequest, props) {
  const params = await props.params;

  const data = await request.json();

  const response = await openai.beta.assistants.update(params.assistantId, {
    instructions: data.instructions,
  });

  return Response.json(response);
}
