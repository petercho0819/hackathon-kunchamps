"use client";

import { assistantId } from "@/app/assistant-config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import axiosApi from "@/app/utils/axios";

export default function Editor({ initialValue }: { initialValue: string }) {
  const [instructions, setInstructions] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructions(e.target.value);
  };

  const mutation = useMutation({
    mutationFn: async (instructions: string) => {
      const { data } = await axiosApi.post(`/assistants/${assistantId}`, {
        instructions,
      });

      console.log(data);
    },
  });

  const handleSubmit = () => {
    mutation.mutate(instructions);
  };

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="flex justify-between">
        <div className="font-bold">instructions</div>
        <Button loading={mutation.isPending} onClick={handleSubmit}>
          edit prompt
        </Button>
      </div>

      <Textarea
        className="min-h-10/12 w-2xl"
        placeholder="instructions"
        value={instructions}
        onChange={handleChange}
      />
    </div>
  );
}
