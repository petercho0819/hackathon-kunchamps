"use client";
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
} from "@mui/material";
import { Character, IMAGE_LIST, LEVELS, PLACES, Place } from "@/constants";

export default function ChoiceForm({
  onSubmit,
}: {
  onSubmit: (input: {
    place: Place;
    character: Character;
    level: number;
    role: string;
  }) => void;
}) {
  const [selectedImageId, setSelectedImageId] = useState<Character | null>(
    null
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const options = ["친구", "연인", "직장동료", "기타"];
  const [persona, setPersona] = useState(options[0]);
  const [customInput, setCustomInput] = useState("");

  const handlePersonaChange = (e) => {
    const value = e.target.value;
    setPersona(value);

    // 기타 이외의 옵션을 선택하면 사용자 입력 초기화
    if (value !== "기타") {
      setCustomInput("");
    }
  };

  const handleCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomInput(value);
  };

  // 최종 persona 값 (기타 선택 시 사용자 입력을 반환)
  const finalPersona = persona === "기타" ? customInput : persona;

  const [open, setOpen] = useState(false);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [customPlace, setCustomPlace] = useState("");
  const [places, setPlaces] = useState(PLACES);

  const handleClose = () => {
    setOpen(false);
  };

  const handlePlaceModalClose = () => {
    setCustomPlace("");
    setPlaceModalOpen(false);
  };

  const handleImageClick = (imageId) => {
    setSelectedImageId(imageId);
  };

  const isAllSelected = () => {
    return (
      finalPersona && selectedImageId && selectedPlace && selectedLevel > 0
    );
  };

  const handleAddImage = () => {
    setOpen(true);
  };

  const startChat = () => {
    onSubmit({
      place: selectedPlace,
      character: selectedImageId,
      level: selectedLevel,
      role: finalPersona,
    });
  };
  const handleAddPlace = () => {
    setPlaceModalOpen(true);
  };
  const handleConfirmPlaceModal = () => {
    if (!customPlace || customPlace == "") {
      alert("장소를 입력해주세요");
      return;
    }
    const isDuplicatePlace = places.some((v) => v.label == customPlace);
    if (isDuplicatePlace) {
      alert("동일한 장소가 있습니다.");
      return;
    }
    setPlaces([
      ...places,
      { id: customPlace, label: customPlace, isCustom: true },
    ]);
    setCustomPlace("");
    setPlaceModalOpen(false);
  };

  const handleDeletePlace = (placeId) => {
    // 선택된 장소가 삭제되는 장소인 경우 선택 해제
    if (selectedPlace === placeId) {
      setSelectedPlace(null);
    }

    // places 배열에서 해당 id를 가진 장소 제거
    setPlaces(places.filter((place) => place.id !== placeId));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-xl shadow-lg space-y-12">
        {/* 이미지 섹션 */}
        <div className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">페르소나 선택</h2>
          <div className="flex gap-4 flex-wrap">
            {IMAGE_LIST.map((image) => (
              <div
                key={image.id}
                className="relative cursor-pointer group"
                onClick={() => handleImageClick(image.id)}
              >
                <img
                  src={image.url}
                  alt={image.id}
                  className={`w-32 h-32 object-cover rounded-lg transition-all duration-200 ${
                    selectedImageId === image.id
                      ? "border-4 border-blue-500"
                      : "border-2 border-gray-300"
                  }`}
                />
              </div>
            ))}
            {IMAGE_LIST.length < 4 && (
              <button
                onClick={handleAddImage}
                className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* 장소 선택 섹션 */}
        <h2 className="text-xl font-semibold mb-2">장소 선택</h2>
        <div className="flex items-center h-23">
          <div
            className="w-full overflow-x-auto pr-4 h-full flex items-center"
            style={{ maxWidth: "calc(100% - 120px)" }}
          >
            <div className="flex gap-4 min-w-max">
              {places.map((place) => (
                <div key={place.id} className="relative">
                  <button
                    onClick={() => setSelectedPlace(place.id)}
                    className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                      selectedPlace === place.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {place.label}
                  </button>

                  {place.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlace(place.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4 h-full flex items-center">
            <button
              onClick={handleAddPlace}
              className="px-6 py-3 rounded-lg border-2 transition-colors hover:border-blue-300"
            >
              장소 추가
            </button>
          </div>
        </div>

        {/* 페르소나 역할 선택 섹션 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">페르소나 역할 선택</h2>
          <div className="flex flex-wrap gap-4 mb-4 h-13">
            {options.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={option}
                  name="persona"
                  value={option}
                  checked={persona === option}
                  onChange={handlePersonaChange}
                  className="mr-2"
                />
                <label htmlFor={option}>{option}</label>

                {option === "기타" && persona === "기타" && (
                  <input
                    type="text"
                    value={customInput}
                    onChange={handleCustomInputChange}
                    placeholder="역할을 직접 입력하세요"
                    className="ml-2 border border-gray-300 rounded px-3 py-2 w-48"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 난이도 설정 섹션 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">난이도 설정</h2>
          <div className="flex gap-4">
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedLevel === level
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        {/* Start 버튼 */}
        <button
          disabled={!isAllSelected()}
          className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
            isAllSelected()
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={startChat}
        >
          Start Chat
        </button>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">나만의 아이돌 추가</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            현재 기능 개발중
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={placeModalOpen}
        onClose={handlePlaceModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">장소 추가</DialogTitle>
        <DialogContent>
          <Input
            value={customPlace}
            onChange={(e) => {
              setCustomPlace(e.target.value);
            }}
          ></Input>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmPlaceModal} autoFocus>
            확인
          </Button>
          <Button onClick={handlePlaceModalClose} autoFocus>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
