"use server";
import { z } from "zod";
import { replicate } from "@/app/ai-providers";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/app/utils/ai-providers";
import { Character, characterInfoMap, examplePrompt, Place } from "@/constants";
import { isExistS3Key, uploadToS3 } from "@/app/actions/s3";
import supabase from "../api/supabase/supabase";

async function getSituationKeyword(character, place, role, situationKeywords) {
  // DB에서 상황 키워드 조회
  let situationKeywordsFromDB = await getSituationKeywordByPlace(
    character,
    place,
    role
  );

  // 키워드가 없으면 새로 생성
  if (situationKeywordsFromDB.length === 0) {
    situationKeywordsFromDB = await createSituationKeyword(
      character,
      place,
      role,
      situationKeywords
    );
  }

  // 랜덤하게 상황 선택하여 반환
  return getRandomSituation(situationKeywordsFromDB);
}

export async function coreGeneratingSituation({
  character,
  place: inputPlace,
  level,
  role,
}: {
  character: Character;
  place: Place;
  level: number;
  role: string;
}) {
  console.log("coreGeneratingSituation()");

  const { situationKeywords, situationDetail, userRole, assistantRole, place } =
    await createSituationDetail({
      character,
      place: inputPlace,
      role,
    });
  const situationKeyword = await getSituationKeyword(
    character,
    place,
    role,
    situationKeywords
  );

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
        situationDetail,
        character,
        role: assistantRole,
        situationKeyword,
      }),
      createBackgroundImage({
        place,
        situationDetail,
        situationKeyword,
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
    situationKeywords: z.array(z.string()), // Changed back to simple array
    assistantRole: z.string(),
    userRole: z.string(),
    place: z.string(),
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
- 주어진 장소에 맞게 역할을 부여해주고 디테일한 상황도 작성해주세요
- 상황에 대한 키워드는 정확히 5가지를 작성해주세요 (반드시 5개의 키워드가 필요합니다)
- 각 키워드는 한단어로 공백없이 케밥케이스로 작성해주세요
- 당신의 성별은 "${characterInfo.gender}" 이고, 이름은 "${characterInfo.name}" 입니다.
- 당신의 역할은 ${role} 입니다.
- 장소는 ${place} 이고, 공백없이 케밥케이스로 작성해주세요

- important!: output must be english
`.trim(),
      },
    ],
    response_format: zodResponseFormat(RolePlayingSituationEvent, "event"),
  });

  const event = completion.choices[0].message.parsed;

  console.log({
    situation: event.situationDetail,
    situationKeywords: event.situationKeywords, // Updated log to show array
    assistantRole: event.assistantRole,
    userRole: event.userRole,
    place: event.place,
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
level 1 : 기본적인 인사와 자기소개 가능
          간단한 질문과 대답 가능 (이름, 나이, 국적 등)
          숫자, 요일, 시간 표현 이해 가능
          일상적인 기본 단어 약 500~800개 정도 이해
level 2 : 일상생활에 필요한 기본 대화 가능
          과거, 현재, 미래 시제 구분 가능
          간단한 문장 구성 및 연결 가능
          약 1,500개 정도의 어휘 이해
          기본적인 문법 구조 이해
level 3 : 일상 대화와 간단한 토론 참여 가능
          다양한 문법 구조와 표현 사용 가능
          간단한 뉴스나 기사 이해 가능
          약 3,000개 정도의 어휘 이해
          자신의 의견이나 생각을 논리적으로 표현 가능
level 4 : 복잡한 주제에 대한 토론 참여 가능
          다양한 매체(TV, 라디오, 신문)의 내용 이해 가능
          격식과 비격식 언어 구분하여 사용 가능
          약 5,000~6,000개 정도의 어휘 이해
          문화적 뉘앙스 이해 및 적절한 관용어 사용 가능
level 5 : 거의 원어민 수준의 유창함
          학술적, 전문적인 주제 이해 및 논의 가능
          미묘한 문화적 차이와 언어적 뉘앙스 이해
          8,000개 이상의 어휘 이해
          복잡한 문학 작품 이해 및 감상 가능
          다양한 방언과 사회언어학적 변이 인식 가능
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
  situationDetail,
  situationKeyword,
  place,
  role,
}: {
  character: Character;
  situationDetail: string;
  situationKeyword: string;
  place: string;
  role: string;
}) {
  const key = `avatar/${character}-${situationKeyword}-${place}-${role}`;

  console.log({
    avatarImageKey: key,
  });

  if (await isExistS3Key(key)) {
    return {
      avatarImageKey: key,
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
- situation: ${situationDetail}
- situationKeyword: ${situationKeyword}

# important!
- Only one person should be depicted.
- ${model.triggerWord} must be depicted with the entire body excluding anything below the knees. 
- ${model.triggerWord} is a realistic character.
- background should not be included.
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

  let prompt = `${event.prompt}
# important!
- background is green like chromakey.
- Please do not render objects excluding ${model.triggerWord}.
- Focus solely on the character with no background
- There must be only one character rendered
- The character should be positioned in the center of the image frame.
- Clothes with a deep neckline are not allowed.`;

  if (characterInfo.gender === "female") {
    prompt += `
- Do not describe revealing clothing.
- Describe with non-revealing clothing.`;
  }

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
    }
  );

  const blob = await removeBgOutput.blob();

  const buffer = await blob.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  await uploadToS3({
    key,
    buffer: bufferData,
    contentType: blob.type,
  });

  return {
    avatarImageKey: key,
  };
}

async function createBackgroundImage({
  place,
  situationDetail,
  situationKeyword,
}: {
  place: string;
  situationDetail: string;
  situationKeyword: string;
}) {
  const key = `background/${place}-${situationKeyword}`;

  console.log({
    bgImageKey: key,
  });

  if (await isExistS3Key(key)) {
    return {
      bgImageKey: key,
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
          content: situationDetail,
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

  await uploadToS3({
    key,
    buffer: bufferData,
    contentType: blob.type,
  });

  return {
    bgImageKey: key,
  };
}

async function getSituationKeywordByPlace(
  persona: string,
  place: string,
  role: string
) {
  const { data, error } = await supabase
    .from("positionKeyWord")
    .select("*")
    .eq("persona", persona)
    .eq("place", place)
    .eq("role", role);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }
  if (data && data.length > 0) {
    return data;
  }
  return [];
}

async function createSituationKeyword(persona, place, role, situationKeywords) {
  const situationKeywordData = situationKeywords.map((situationKeyword) => {
    return {
      persona,
      place,
      role,
      situationKeyword,
    };
  });
  const { error } = await supabase
    .from("positionKeyWord")
    .insert(situationKeywordData);
  if (error) {
    console.error("Error createSituationKeyword data:", error);
    return [];
  }
  return situationKeywordData;
}

function getRandomSituation(situationKeyword): string {
  const ranIndx = Math.floor(Math.random() * situationKeyword.length);
  return situationKeyword[ranIndx].situationKeyword;
}
