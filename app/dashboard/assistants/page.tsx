import { assistantId } from "@/app/assistant-config";
import Editor from "@/app/dashboard/assistants/editor";
import { openai } from "@/app/ai-providers";
import { Separator } from "@/components/ui/separator";
import React from "react";

export default async function AssistantsPage() {
  const myAssistant = await openai.beta.assistants.retrieve(assistantId);

  return (
    <div className="max-w-7xl h-full max-h-full p-2.5">
      <div>name: {myAssistant.name}</div>
      <Separator className="my-2" />

      <Editor initialValue={myAssistant.instructions} />
    </div>
  );
}
