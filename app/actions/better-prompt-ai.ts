"use server";

import { replicate } from "@/app/ai-providers";

const model = "meta/meta-llama-3.1-405b-instruct";

export async function generateBetterPrompt({ myPrompt }: { myPrompt: string }) {
  const prompt = `
**myPrompt**
${myPrompt}
Focus solely on the character with no background, rendered in a visual novel style.
Ensure the character is known by the name "KNORWE_VEE"

Using the provided myPrompt, Write better prompts for an image generation model.
`.trim();

  const output = await replicate.run(model, { input: { prompt } });

  return Array.isArray(output)
    ? output.join("")
    : (output as unknown as string);
}

export async function selectOnePrompt({
  betterPrompt,
}: {
  betterPrompt: string;
}) {
  const prompt = `
Based on the provided instructions, generate the most appropriate single prompt that can be directly passed to the image generation model.

Remember:
- Only output the generated prompt.
- Focus solely on the character with no background.
${betterPrompt}
`.trim();

  const output = await replicate.run(model, { input: { prompt } });

  return Array.isArray(output)
    ? output.join("")
    : (output as unknown as string);
}
