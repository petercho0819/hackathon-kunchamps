"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ChoiceForm from "@/app/components/choice";

const ChoicePage = () => {
  const router = useRouter();

  return (
    <ChoiceForm
      onSubmit={({ place, character, level }) => {
        const params = new URLSearchParams();

        params.set("place", place);
        params.set("character", character);
        params.set("level", level.toString());

        router.push(`/dashboard/chat/prepare?${params.toString()}`);
      }}
    />
  );
};

export default ChoicePage;
