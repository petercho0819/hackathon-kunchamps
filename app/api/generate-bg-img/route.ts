import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getPrompt } from "./function";

export async function POST(request: Request) {
  try {
    const { selectedPlace } = await request.json();

    const prompt = getPrompt(selectedPlace);

    // Replicate API 호출
    if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
      throw new Error("API token not configured");
    }

    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
    });

    const output: unknown = await replicate.run("google/imagen-3-fast", {
      input: {
        prompt,
        aspect_ratio: "1:1",
        safety_filter_level: "block_medium_and_above",
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const url = await output?.url();

    return NextResponse.json({ success: true, imgUrl: url.href });
  } catch (error) {
    console.error("Error processing voice input:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process voice input" },
      { status: 500 }
    );
  }
}
