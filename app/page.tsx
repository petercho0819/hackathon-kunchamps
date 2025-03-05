"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";

const Home = () => {
  const categories = {
    "Basic chat": "basic-chat",
    "Function calling": "function-calling",
    "File search": "file-search",
    All: "all",
  };

  return (
    <main className="flex flex-col justify-center items-center h-screen bg-white">
      <h1 className="text-2xl mb-5 font-semibold">Kunchamps</h1>
      <div className="flex flex-row gap-5 max-w-5xl w-full p-5 box-border items-center justify-center">
        <a
          className="text-black bg-green-300 flex text-base rounded-4xl justify-center items-center text-center cursor-pointer max-w-xs w-30 h-30 p-5 transition-colors duration-300 font-medium hover:bg-gray-300"
          href={`/dashboard/choice`}
        >
          start
        </a>

        <a
          className="text-black flex text-base rounded-4xl justify-center items-center text-center bg-gray-200 cursor-pointer max-w-xs w-30 h-30 p-5 transition-colors duration-300 font-medium hover:bg-gray-300"
          href={`/dashboard/assistants`}
        >
          my assistant info
        </a>
        {/**/}
        {/* <a */}
        {/*   className="text-black flex text-base rounded-4xl justify-center items-center text-center bg-gray-200 cursor-pointer max-w-xs w-30 h-30 p-5 transition-colors duration-300 font-medium hover:bg-gray-300" */}
        {/*   href={`/dashboard/generation/form`} */}
        {/* > */}
        {/*   test ai */}
        {/* </a> */}
      </div>

      {/* <Separator className="m-20" /> */}
      {/**/}
      {/* <h1 className="text-2xl font-semibold"> */}
      {/*   Explore sample apps built with Assistants API (template Examples) */}
      {/* </h1> */}
      {/**/}
      {/* <div className="flex flex-row gap-5 max-w-5xl w-full p-5 box-border items-center justify-center"> */}
      {/*   {Object.entries(categories).map(([name, url]) => ( */}
      {/*     <a */}
      {/*       key={name} */}
      {/*       className="text-black flex text-base rounded-4xl justify-center items-center text-center bg-gray-200 cursor-pointer max-w-xs w-30 h-30 p-5 transition-colors duration-300 font-medium hover:bg-gray-300" */}
      {/*       href={`/examples/${url}`} */}
      {/*     > */}
      {/*       {name} */}
      {/*     </a> */}
      {/*   ))} */}
      {/* </div> */}
    </main>
  );
};

export default Home;
