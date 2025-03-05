"use client";

import React from "react";
import { RouterPath } from "@/constants";
import ChoiceForm from "@/app/components/choice";
import { GeneratedChat } from "@/app/components/generated-chat";

const Home = () => {
  const [routerPath, setRouterPath] = React.useState(RouterPath.Home);

  const [formData, setFormData] = React.useState({
    place: "",
    character: "",
    level: 0,
  });

  if (routerPath === RouterPath.Home) {
    return <HomeStart setRouterPath={setRouterPath} />;
  }

  if (routerPath === RouterPath.Form) {
    return (
      <div className="size-full flex justify-center items-center">
        <ChoiceForm
          onSubmit={({ place, character, level }) => {
            setFormData({ place, character, level });
            setRouterPath(RouterPath.Chat);
          }}
        />
      </div>
    );
  }
  //
  if (routerPath === RouterPath.Chat) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <GeneratedChat {...formData} />;
  }

  return null;
};

function HomeStart({ setRouterPath }) {
  return (
    <main className="flex flex-col justify-center items-center h-screen bg-white">
      <h1 className="text-2xl mb-5 font-semibold">Kunchamps</h1>
      <div className="flex flex-row gap-5 max-w-5xl w-full p-5 box-border items-center justify-center">
        <div
          onClick={() => setRouterPath(RouterPath.Form)}
          className="text-black bg-green-300 flex text-base rounded-4xl justify-center items-center text-center cursor-pointer max-w-xs w-30 h-30 p-5 transition-colors duration-300 font-medium hover:bg-gray-300"
        >
          start
        </div>
      </div>
    </main>
  );
}

export default Home;
