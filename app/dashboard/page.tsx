"use client";

import { assistantId } from "@/app/assistant-config";
import apiAxios from "@/app/utils/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [newAssistantId, setNewAssistantId] = useState(assistantId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const { data } = await apiAxios.post(
      "/assistants",
      Object.fromEntries(formData),
    );

    setNewAssistantId(data.assistantId);
    setLoading(false);
  };

  return (
    <div className="gap-3">
      <h1 className="text-2xl mb-3">Create Assistants</h1>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="place">장소</Label>

          <Input
            type="text"
            id="place"
            name="place"
            placeholder="가게"
            defaultValue={"가게"}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="situation">상황</Label>
          <Input
            type="text"
            id="situation"
            name="situation"
            placeholder="주문하기"
            defaultValue={"주문하기"}
          />
        </div>

        <Button disabled className="w-full" type="submit">
          어시스턴트 만들기
        </Button>
      </form>

      <div className="my-3">
        {newAssistantId && <div>어시스트 id: {newAssistantId}</div>}
      </div>

      <div className="mt-5">
        <Button asChild className="w-full">
          <a href={`/dashboard/chat`}>chat 으로 이동...</a>
        </Button>
      </div>
    </div>
  );
}
