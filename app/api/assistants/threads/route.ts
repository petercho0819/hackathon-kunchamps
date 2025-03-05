import { openai } from "@/app/ai-providers";

export const runtime = "nodejs";

// Create a new thread
export async function POST() {
  const thread = await openai.beta.threads.create();

  /**
   * TODO: 초기 컨텍스트 주입
   *  - 장소
   *  - 인물
   *  - 난이도
   */

  return Response.json({ threadId: thread.id });
}
