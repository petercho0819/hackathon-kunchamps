"use server";
import { replicate } from "@/app/ai-providers";
import { Character, Place } from "@/constants";

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
      "yanguk/knowre-iu:f998defcfa6b2eaab488a37f6e87b4ddfeaa34defe3eb12f25143bee4c35fdd9",
    // 모델생성할때 실수로 케밥케이스로 만들어버림...
    triggerWord: "KNOWRE-IU",
  },
};

export async function generateCharacterAIAsset({
  character,
  prompt,
  place,
}: {
  character: Character;
  prompt: string;
  place: Place;
}) {
  const model = modelMap[character];

  if (!model) {
    throw new Error("Character not supported");
  }

  const output = await replicate.run(`yanguk/${model}`, {
    input: {
      model: "dev",
      go_fast: false,
      prompt,
      width: 720,
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

  // const fileName = `${nanoid()}.png`;

  // TODO: 이미지 저장도 S3에 그냥 넣기
  // TODO: remove bg
  // TODO: 이미지 저장
  // await writeFile(
  //   `../../public/character/${character}/${place}/${fileName}`,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   output as any,
  // );

  return output;
}
