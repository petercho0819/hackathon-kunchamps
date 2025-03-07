"use server";
import { z } from "zod";
import { replicate } from "@/app/ai-providers";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/app/utils/ai-providers";
import { Character, characterInfoMap, examplePrompt, Place } from "@/constants";
import { uploadToS3 } from "@/app/actions/s3";
import { getFixedAvataKey, getFixedBgKey } from "@/lib/fixed-images";

export async function coreGeneratingSituation({
  character,
  place,
  level,
  role,
}: {
  character: Character;
  place: Place;
  level: number;
  role: string;
}) {
  console.log("coreGeneratingSituation()");

  const { situationDetail, userRole, assistantRole } =
    await createSituationDetail({
      character,
      place,
      role,
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
  role,
}: {
  character: string;
  place: string;
  role: string;
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
당신의 역할은 ${role} 입니다.

- 장소: ${place}
`.trim(),
      },
    ],
    response_format: zodResponseFormat(RolePlayingSituationEvent, "event"),
  });

  const event = completion.choices[0].message.parsed;

  console.log({
    situation: event.situationDetail,
  });

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
# assistantRole
- role: ${assistantRole}
- name: ${characterInfoMap[character].name}

# user
- role: ${userRole}

# situation and conversation level
The conversation level has 1 to 5 level.
난이도에 따라서 문장의 길이와 단어의 선택이 달라집니다.

Please proceed with the conversation according to the given situation.

- level: ${level}
- place: ${place}
- situation: ${situationDetail}
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
  const pixedImageKey = getFixedAvataKey({
    character,
    place,
  });

  if (pixedImageKey) {
    return {
      avatarImageKey: pixedImageKey,
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
Focus on depicting a realistic character
Ensure the character is known by the name ${model.triggerWord}

Using the provided information, Write prompt for an image generation model.

- gender: ${characterInfo.gender}
- role: ${role}
- place: ${place}
- situation: ${situation}

# important!
- Only one person should be depicted.
- ${model.triggerWord} must be depicted with the entire body, 
- ${model.triggerWord} is a realistic character.
`.trim();

  if (characterInfo.gender === "female") {
    content += `
- The outfit should not be revealing, such as a skirt a t-shirt that shows your sternum, and must be modest. It is preferable to dress her in clothing that does not emphasize femininity.
- Clothes with a deep neckline are not allowed.
- Do not describe revealing clothing.
- Describe with non-revealing clothing.
`;
  }

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

  const prompt = `${event.prompt}
# important!
- Please do not render objects excluding ${model.triggerWord}.
- Focus solely on the character with no background
- The character should be positioned in the center of the image frame.`;

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

  console.log({
    avatarImageKey: key,
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
  const fixedBgKey = getFixedBgKey({
    place,
  });

  if (fixedBgKey) {
    return {
      bgImageKey: fixedBgKey,
    };
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

  console.log({
    bgImageKey: key,
  });

  return {
    bgImageKey: key,
  };
}
