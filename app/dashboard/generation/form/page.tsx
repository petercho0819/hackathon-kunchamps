"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ChoiceForm from "@/app/components/choice";

export default function Page() {
  const router = useRouter();

  const onSubmit = ({ selectedImage, selectedPlace, selectedLevel, role }) => {
    const params = new URLSearchParams();

    params.set("imageId", selectedImage.id);
    params.set("placeId", selectedPlace.id);
    params.set("level", selectedLevel.toString());
    params.set("role", role.toString());

    router.push(`/dashboard/generation/ai?${params.toString()}`);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  return <ChoiceForm onSubmit={onSubmit} />;
}
