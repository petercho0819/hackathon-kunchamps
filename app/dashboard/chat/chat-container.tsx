"use client";
/* eslint-disable @next/next/no-img-element */
import React, { PropsWithChildren } from "react";
import Image from "next/image";

export default function ChatContainer({
  backgroundImageUri,
  children,
  avatarUri,
}: PropsWithChildren<{ backgroundImageUri: string; avatarUri: string }>) {
  return (
    <div className="h-screen w-full relative flex flex-col">
      {/* Background Image */}
      <img
        src={backgroundImageUri}
        alt="Visual Novel Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Full-height gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30 z-5" />

      <div className="pt-10 h-5/6 relative">
        <Image src={avatarUri} alt="model" layout="fill" objectFit="cover" />
      </div>

      {children}
    </div>
  );
}
