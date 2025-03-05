// store/useChoiceStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** @deprecated 일단 없어도 될듯 query로 대체 */
const useChoiceStore = create(
  persist(
    (set) => ({
      selectedImage: null,
      selectedPlace: null,
      selectedLevel: 0,
      selectedImageUrl: null,

      setChoices: (image, place, level, imageUrl) =>
        set({
          selectedImage: image,
          selectedPlace: place,
          selectedLevel: level,
          selectedImageUrl: imageUrl,
        }),

      resetChoices: () =>
        set({
          selectedImage: null,
          selectedPlace: null,
          selectedLevel: 0,
          selectedImageUrl: null,
        }),
    }),
    {
      name: "choice-storage",
      partialize: (state) => ({
        selectedImage: state.selectedImage,
        selectedPlace: state.selectedPlace,
        selectedLevel: state.selectedLevel,
        selectedImageUrl: state.selectedImageUrl,
      }),
    },
  ),
);

export default useChoiceStore;
