"use server";
import { z } from "zod";
import { replicate } from "@/app/ai-providers";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/app/utils/ai-providers";
import { Character, characterInfoMap, examplePrompt, Place } from "@/constants";
import { uploadToS3 } from "@/app/actions/s3";

// 과금방지용으로 개발시 비활성화
const IS_DISABLE_GENERATING = process.env.IS_DISABLE_GENERATING === "1";

// Important:
export async function coreGeneratingSituation({
  character,
  place,
  level,
}: {
  character: Character;
  place: Place;
  level: number;
}) {
  console.log("coreGeneratingSituation()");

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const { situationDetail, userRole, assistantRole } =
    await createSituationDetail({
      character,
      place,
    });

  const [{ id: threadId }, { avatarImageKey }, { bgImageKey }] =
    await Promise.all([
      createThreadId({
        character,
        level,
        place,
        situationDetail,
        userRole,
        assistantRole,
      }),
      createCharacterImage({
        place,
        situation: situationDetail,
        character,
        role: assistantRole,
      }),
      createBackgroundImage({
        place,
        situation: situationDetail,
      }),
    ]);

  return {
    bgImageKey,
    avatarImageKey,
    threadId,
  };
}

async function createSituationDetail({
  character,
  place,
}: {
  character: string;
  place: string;
}) {
  const characterInfo = characterInfoMap[character];

  const RolePlayingSituationEvent = z.object({
    situationDetail: z.string(),
    assistantRole: z.string(),
    userRole: z.string(),
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `
롤 플레잉 게임 전문가가 되어보세요.
${examplePrompt}
`.trim(),
      },
      {
        role: "user",
        content: `
주어진 장소에 맞게 역할을 부여해주고 디테일한 상황도 작성해줘
당신의 성별은 "${characterInfo.gender}" 이고, 이름은 "${characterInfo.name}" 입니다.

- 장소: ${place}
`.trim(),
      },
    ],
    response_format: zodResponseFormat(RolePlayingSituationEvent, "event"),
  });

  const event = completion.choices[0].message.parsed;

  return event;
}

async function createThreadId({
  character,
  level,
  situationDetail,
  userRole,
  assistantRole,
  place,
}: {
  character: Character;
  level: number;
  situationDetail: string;
  userRole: string;
  assistantRole: string;
  place: string;
}) {
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `
# 당신의 역할
- role: ${assistantRole}
- name: ${characterInfoMap[character].name}

# 대화상대인 나의 역할
- role: ${userRole}

# 상황및 회화 레펠단계
회화 레벨 단계는 1 ~ 5 단계가 있습니다.
주어진 상황에 맞게 대화를 진행해주세요.

- 레벨: ${level}
- 장소: ${place}
- 상황: ${situationDetail}
`.trim(),
    metadata: {
      role: "system",
    },
  });

  return thread;
}
async function createCharacterImage({
  character,
  situation,
  place,
  role,
}: {
  character: Character;
  situation: string;
  place: string;
  role: string;
}) {
  if (IS_DISABLE_GENERATING) {
    const avatarImageKey =
      character === "iu" ? "avatar/B1qt3HZAMh6wjCxgvBjo0" : "avatar/vee";

    return {
      avatarImageKey,
    };
  }

  const modelMap: Record<
    Character,
    {
      triggerWord: string;
      modelName: string;
    }
  > = {
    vee: {
      modelName:
        "knowre-vee:4302cd519c29c02d97a7cdae945862e25fc1f7ccea49817ed07466d252a73844",
      triggerWord: "KNORWE_VEE",
    },
    iu: {
      modelName:
        "knowre-iu:f998defcfa6b2eaab488a37f6e87b4ddfeaa34defe3eb12f25143bee4c35fdd9",
      // 모델생성할때 실수로 케밥케이스로 만들어버림...
      triggerWord: "KNOWRE-IU",
    },
  };

  const characterInfo = characterInfoMap[character];
  const model = modelMap[character];

  let content = `
Focus solely on the character with no background
Focus on depicting a realistic character in a visual novel style.
Ensure the character is known by the name ${model.triggerWord}

Using the provided information, Write prompt for an image generation model.

- 성별: ${characterInfo.gender}
- role: ${role}
- place: ${place}
- situation: ${situation}
`.trim();

  if (characterInfo.gender === "female") {
    content += `
# important!
The outfit should not be revealing, such as a skirt, and must be modest. It is preferable to dress her in clothing that does not emphasize femininity.
`.trim();
  }

  console.log({
    situation,
  });

  const promptOutput = z.object({
    prompt: z.string(),
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: "Image generation model prompt engineer expert.",
      },
      {
        role: "user",
        content,
      },
    ],
    response_format: zodResponseFormat(promptOutput, "event"),
  });

  const event = completion.choices[0].message.parsed;

  const prompt =
    event.prompt +
    `The important point is: 인물을 그릴 때 인물의 얼굴 부터 무릎까지 그려줘"`;

  console.log({
    modelPrompt: prompt,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelOutput: any = await replicate.run(`yanguk/${model.modelName}`, {
    input: {
      model: "dev",
      go_fast: false,
      prompt,
      lora_scale: 1,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "webp",
      guidance_scale: 3,
      output_quality: 80,
      prompt_strength: 0.8,
      extra_lora_scale: 1,
      num_inference_steps: 28,
    },
  });

  const url = modelOutput[0].url().href;

  // 누끼 따고 S3저장하기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeBgOutput: any = await replicate.run(
    "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
    {
      input: {
        image: url,
      },
    },
  );

  const blob = await removeBgOutput.blob();

  const buffer = await blob.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  const { key } = await uploadToS3({
    type: "avatar",
    buffer: bufferData,
    contentType: blob.type,
  });

  return {
    avatarImageKey: key,
  };
}

async function createBackgroundImage({
  place,
  situation,
}: {
  place: string;
  situation: string;
}) {
  if (IS_DISABLE_GENERATING) {
    if (place == "cafe")
      return {
        bgImageKey: "background/VFnxvWpKpJHOkYKxDPKUI",
      };
    else if (place == "movie")
      return {
        bgImageKey: "background/XMC2UB2MxHLB2V_HihLz7",
      };
    else {
      return {
        bgImageKey: "background/GQkOjMTYgZcV0frtyBPvt",
      };
    }
  }

  const getAiPrompt = async () => {
    const promptOutput = z.object({
      prompt: z.string(),
    });

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "Background image generation model prompt engineer, focusing solely on background descriptions and ensuring that characters are excluded from the image.",
        },
        {
          role: "user",
          content: situation,
        },
      ],
      response_format: zodResponseFormat(promptOutput, "event"),
    });

    const event = completion.choices[0].message.parsed;

    const prompt =
      event.prompt + ' important point: "No characters in the scene."';

    return prompt;
  };

  const prompt = await getAiPrompt();

  console.log({
    bgPrompt: prompt,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: any = await replicate.run("google/imagen-3-fast", {
    input: {
      prompt,
      aspect_ratio: "1:1",
      safety_filter_level: "block_medium_and_above",
    },
  });

  const blob = await output.blob();
  const buffer = await blob.arrayBuffer();

  const bufferData = Buffer.from(buffer);

  const { key } = await uploadToS3({
    type: "background",
    buffer: bufferData,
    contentType: blob.type,
  });

  return {
    bgImageKey: key,
  };
}
