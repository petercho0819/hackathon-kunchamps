import { NextResponse } from "next/server";
import { coreGeneratingSituation } from "@/app/actions/core-generator";

export async function POST(request: Request) {
  try {
    const { place, character, level, role } = await request.json();

    const res = await coreGeneratingSituation({
      character,
      place,
      level,
      role,
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error processing voice input:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process voice input" },
      { status: 500 }
    );
  }
}
