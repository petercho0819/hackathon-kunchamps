/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
// import { Mic } from "lucide-react";
// import useChoiceStore from "../store/useChoiceStore"; // 경로 확인 필요
import LoadingIndicator from "@/app/components/indicatior";
// import { cn } from "@/lib/utils";
import { firstUserMsg, Place, placeInfoMap } from "@/constants";
import { IMAGES } from "@/asset/images";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  imageUrl: string;
};

interface AssistantMessageProps {
  text: string;
  imageUrl: string;
}

const UserMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg">
        {text}
      </div>
    </div>
  );
};

const AssistantMessage = ({ text, imageUrl }: AssistantMessageProps) => {
  return (
    <div className="inline-flex items-start">
      <div className="mr-2 pt-2">
        <img
          src={imageUrl}
          alt="Assistant Avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
      <div className={styles.assistantMessage}>
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text, imageUrl }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage imageUrl={imageUrl} text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type Message = {
  role: "user" | "assistant";
  text: string;
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall,
  ) => Promise<string>;
  imageId: string;
  threadId: string;
  messageHistory?: Message[];
};

export default function Chat({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string

  imageId,
  threadId,
  messageHistory = [],
}: ChatProps) {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState(messageHistory);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isInit = messages.length === 0;

  // const [isRecording, setIsRecording] = useState(false);
  // const selectedPlace = useChoiceStore((state) => state.selectedPlace);
  // const mediaRecorderRef = useRef(null);
  // const responseCompletedRef = useRef(false);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new threadID when chat component created
  // useEffect(() => {
  //   const createThread = async () => {
  //     const res = await fetch(`/api/assistants/threads`, {
  //       method: "POST",
  //     });
  //     const data = await res.json();
  //     setThreadId(data.threadId);
  //   };
  //   if (messages.length === 0) {
  //     createThread();
  //   }
  // }, [messages.length]);

  // 초기 ai 대화로 시작하기 위함
  useEffect(() => {
    if (isInit && threadId) {
      sendMessage(firstUserMsg, {
        role: "system",
      });
      setInputDisabled(true);
      setIsLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, isInit]);

  const sendMessage = async (text, metadata = undefined) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
          metadata,
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    setIsLoading(true);
    scrollToBottom();
  };
  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
    setIsLoading(false);
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      }),
    );
    setInputDisabled(true);
    setIsLoading(true);
    submitActionResult(runId, toolCallOutputs);
  };

  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  // WARN: 데모에서 TTS 제외
  // useEffect(() => {
  //   // responseCompletedRef가 true이고 메시지가 존재하는 경우에만 TTS 처리
  //   if (responseCompletedRef.current && messages.length > 0) {
  //     const lastAssistantMessage = messages.findLast(
  //       (msg) => msg.role === "assistant",
  //     );
  //
  //     if (lastAssistantMessage) {
  //       const plainText = lastAssistantMessage.text
  //         .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 마크다운 제거
  //         .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // 링크 마크다운 제거
  //         .replace(/`{3}[\s\S]*?`{3}/g, "") // 코드 블록 제거
  //         .replace(/`([^`]+)`/g, "$1") // 인라인 코드 제거
  //         .replace(/#+\s(.*?)\n/g, "$1 ") // 헤더 정리
  //         .trim();
  //
  //       speakTextWithAPI(plainText);
  //
  //       // TTS 처리 후 플래그 재설정
  //       responseCompletedRef.current = false;
  //     }
  //   }
  // }, [responseCompletedRef.current]);

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") {
        // responseCompletedRef.current = true;
        handleRunCompleted();
      }
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`,
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  // WARN: STT 제외
  // const speakTextWithAPI = async (text) => {
  //   if (!IS_ACTIVE_TTS_STT) {
  //     return;
  //   }
  //
  //   try {
  //     const response = await fetch("/api/text-to-speech", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         text: text,
  //         language: "ko",
  //       }),
  //     });
  //
  //     const data = await response.json();
  //
  //     const audio = new Audio(data.audioUrl);
  //     audio
  //       .play()
  //       .then(() => {
  //         console.log("Audio is playing");
  //       })
  //       .catch((err) => {
  //         console.error("Error playing audio:", err);
  //       });
  //   } catch (error) {
  //     console.error("TTS API Error:", error);
  //
  //     // 로딩 인디케이터가 남아있다면 제거
  //     const loadingIndicator = document.querySelector(
  //       'div[textContent="🔊 음성 변환 중..."]',
  //     );
  //     if (loadingIndicator && loadingIndicator.parentNode) {
  //       loadingIndicator.parentNode.removeChild(loadingIndicator);
  //     }
  //
  //     alert(`음성 변환 오류: ${error.message}`);
  //     return false;
  //   }
  // };

  // 이미지 외부 에서 생성
  // useEffect(() => {
  //   const fetchImage = async () => {
  //     if (IS_ACTIVE_GENERATE_BG_IMG) {
  //       try {
  //         const response = await fetch("/api/generate-bg-img", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             selectedPlace,
  //           }),
  //         });
  //
  //         const data = await response.json();
  //         const { imgUrl } = data;
  //         setBackgroundImageUrl(imgUrl);
  //       } catch (err) {
  //         console.log(err);
  //       }
  //     } else {
  //       // 과금방지를 위해 생성된 이미지 사용
  //       // TODO
  //       setBackgroundImageUrl(
  //         "https://replicate.delivery/xezq/GPD3m9vh5SoFLpIier36ZknCmeooSAXvQfgTTnrjQsAuC5moA/tmp9m6cjdg1.png",
  //       );
  //     }
  //   };
  //   if (selectedPlace) fetchImage();
  // }, [selectedPlace]);

  // useEffect(() => {
  //   console.log("selectedPlace", selectedPlace);
  //   //!to-do: 아이돌 이미지를 호출 + 누끼제거
  //   //        현재는 이미지 url을 hard로
  //   // https://ai-hackathon-kunchams.s3.ap-northeast-2.amazonaws.com/rose_without_bg.png
  // }, []);

  // const handleVoiceInput = async () => {
  //   if (!IS_ACTIVE_TTS_STT) {
  //     return;
  //   }
  //   try {
  //     if (isRecording) {
  //       mediaRecorderRef.current.stop();
  //       setIsRecording(false);
  //     } else {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //       });
  //       const mediaRecorder = new MediaRecorder(stream);
  //       mediaRecorderRef.current = mediaRecorder;
  //
  //       const audioChunks = [];
  //
  //       mediaRecorder.ondataavailable = (event) => {
  //         audioChunks.push(event.data);
  //       };
  //
  //       mediaRecorder.onstop = async () => {
  //         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  //         const reader = new FileReader();
  //
  //         reader.onload = async () => {
  //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //           //@ts-expect-error
  //           const base64Audio = reader.result?.split(",")[1];
  //           try {
  //             // Call your backend endpoint instead of Replicate directly
  //             const response = await fetch("/api/process-voice", {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify({
  //                 audio: base64Audio,
  //                 language: "ko",
  //               }),
  //             });
  //
  //             if (!response.ok) {
  //               const errorData = await response.json();
  //               throw new Error(
  //                 errorData.error || "Failed to process voice input",
  //               );
  //             }
  //
  //             const data = await response.json();
  //             if (data.transcription === "NO_TRANSCRIPTION") {
  //               alert("소리를 내어주세요");
  //               return;
  //             }
  //             sendMessage(data?.transcription);
  //             setMessages((prevMessages) => [
  //               ...prevMessages,
  //               { role: "user", text: data?.transcription },
  //             ]);
  //           } catch (error) {
  //             console.error("Error processing voice input:", error);
  //           } finally {
  //           }
  //         };
  //
  //         reader.readAsDataURL(audioBlob);
  //
  //         // Clean up the media stream
  //         stream.getTracks().forEach((track) => track.stop());
  //       };
  //
  //       mediaRecorder.start();
  //       setIsRecording(true);
  //     }
  //   } catch (error) {
  //     console.error("Error accessing microphone:", error);
  //   }
  // };

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center z-20 pb-8">
      <div className="w-full max-w-4xl px-4">
        {/* Semi-transparent blurred background instead of solid black */}
        <div
          className="min-h-50 max-h-50 overflow-y-auto mb-3 p-4 rounded-lg text-white border border-gray-700 border-opacity-40"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        >
          {messages.map((msg, index) => (
            <Message
              key={index}
              role={msg.role}
              text={msg.text}
              imageUrl={IMAGES[imageId]}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form with similar styling */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center rounded-lg p-2 border border-gray-800 border-opacity-40"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        >
          <input
            type="text"
            className="flex-grow p-2 bg-transparent text-white outline-none border-none placeholder-white placeholder-opacity-70"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your question"
          />
          <button
            type="submit"
            className="ml-2 p-2 rounded-full bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white flex items-center justify-center transition-colors"
            disabled={inputDisabled}
          >
            {"Send"}
          </button>
          {/* <button */}
          {/*   type="button" */}
          {/*   className={cn( */}
          {/*     `ml-2 p-2 rounded-full`, */}
          {/*     isRecording */}
          {/*       ? "bg-red-600 bg-opacity-80 hover:bg-opacity-100" */}
          {/*       : "bg-blue-600 bg-opacity-80 hover:bg-opacity-100", */}
          {/*     "text-white flex items-center justify-center transition-colors", */}
          {/*   )} */}
          {/*   onClick={handleVoiceInput} */}
          {/*   disabled={!IS_ACTIVE_TTS_STT} */}
          {/* > */}
          {/*   <Mic size={20} /> */}
          {/* </button> */}
        </form>
      </div>
      {isLoading && <LoadingIndicator className="size-15" />}
    </div>
  );
}
