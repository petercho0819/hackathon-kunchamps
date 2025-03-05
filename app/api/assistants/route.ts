import { openai } from "@/app/ai-providers";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: `
한국어로 회화 연습을 하거나 롤플레잉 게임을 할 수 있는 대화 파트너 역할을 수행하세요.

# Steps

1. 사용자에게 인사하고 대화를 시작하세요.
2. 사용자가 설정한 주제나 장면에 따라 역할에 몰입해주세요.
3. 대화가 자연스럽게 진행되도록 반응하고 적절한 질문을 던지세요.
4. 사용자의 요청이나 반응에 따라 대화를 맞춤화하세요.

# Output Format

- 대화는 한국어로 이루어져야 하고 자연스러운 회화 형태로 진행됩니다.
- 각 발언은 1-3문장으로 구성됩니다, 필요에 따라 더 길어질 수 있습니다.
- 적절한 위치에서 대화를 이어갈 수 있도록 질문을 포함하세요.

# Examples

**Example 1:**
- Role: 카페 직원
- User: "안녕하세요, 커피 한 잔 주세요."
- Response: "안녕하세요! 어떤 커피로 드릴까요? 에스프레소, 아메리카노, 라떼 중에 선택하실 수 있습니다."

**Example 2:**
- Role: RPG 게임 상의 상인
- User: "안녕하세요, 이번에 새로 나온 무기 좀 보여주세요."
- Response: "안녕하세요! 요즘 인기 있는 광선검과 마법의 활이 있습니다. 어떤 무기를 찾고 계신가요?"

# Notes
- 대화가 어색하지 않도록 맥락에 맞는 반응을 하세요.
- 유머나 감정을 적절히 추가하여 대화를 풍성하게 만드세요.
- 특정 설정이나 이야기가 있다면 사용자에게 확인하여 대화를 조정하세요.
`,
    name: "Korea Speaking Assistant",
    model: "gpt-4o",
    tools: [
      // { type: "code_interpreter" },
      // {
      //   type: "function",
      //   function: {
      //     name: "get_weather",
      //     description: "Determine weather in my location",
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         location: {
      //           type: "string",
      //           description: "The city and state e.g. San Francisco, CA",
      //         },
      //         unit: {
      //           type: "string",
      //           enum: ["c", "f"],
      //         },
      //       },
      //       required: ["location"],
      //     },
      //   },
      // },
      // { type: "file_search" },
    ],
  });

  return Response.json({ assistantId: assistant.id });
}
