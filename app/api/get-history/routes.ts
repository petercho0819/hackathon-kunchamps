import { NextResponse } from "next/server";
import { getMessagesHistory } from "@/app/actions/get-history";

export async function POST(request: Request) {
  try {
    const { threadId } = await request.json();

    const res = await getMessagesHistory(threadId);

    return NextResponse.json({ res });
  } catch (error) {
    console.error("Error processing voice input:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process voice input" },
      { status: 500 },
    );
  }
}
