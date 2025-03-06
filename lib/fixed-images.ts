import { Place } from "@/constants";

const IS_GENERATE_AVATA = false;
const IS_GENERATE_BG = false;

export const getFixedAvataKey = ({ place, character }) => {
  if (IS_GENERATE_AVATA) {
    return null;
  }

  if (character === "vee") {
    if (place === Place.cafe) {
      const items = [
        "avatar/C0p6WcPbTWRkcOnTvHF0K",
        "avatar/wnWsyPXD-z9AXylP_YhFy",
        "avatar/I4vTd_mXgLiJpMkplK_Mo",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.movie) {
      const items = [
        "avatar/ETFcuqvfu3wDDHdv98Zfp",
        "avatar/qJ-WvunRx8e6OUIgfZJYl",
        "avatar/PO3Dx4bMofsJ96i5B2Waw",
        "avatar/_i8kYuumr1pHj_6NOoYUb",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.restaurant) {
      const items = [
        "avatar/nTokNTY9ZThbROf8NyeP9",
        "avatar/mClsDD_m1HdU__lYBgL9c",
        "avatar/8A-gEcvK90EDDLzIegnfE",
        "avatar/iZEaGt3aBTuU3p5v-efwh",
        "avatar/srjsBgItMufAGufhIUGNM",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }
  }

  if (character === "iu") {
    if (place === Place.cafe) {
      const items = [
        "avatar/uGa1JsxavdOPiHf4wOj22",
        "avatar/1wBwAfngJObYrHAhEdBUY",
        "avatar/gVFhOQs2O8hdrB-gtCXY3",
        "avatar/HRGWI5EOxtVCgUadtrDz0",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.movie) {
      const items = [
        "avatar/kth3h_K7IldVotdtgcXm5",
        "avatar/NNb56JmtAspG3gg5mg8Zx",
        "avatar/UVVtmUpEbrzFlKXgkcA4M",
        "avatar/FRjOc5aGPQALeef2RYNEU",
        // "avatar/RY49RpHNnQRQOLyJHCQ7D",
        // "avatar/v_NHSIVgh7i8_45k66ml3", 노출있는 의상임.
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.restaurant) {
      const items = [
        "avatar/XHhRpX8TFOW_-IImObBIe",
        // "avatar/KAasRbKwB7UW12bxORCEb", 실사화가 아님
        "avatar/hunWfXtfs4pNKlSryatgt",
        "avatar/eqrRl8iPHYpGb7cL5M53u",
        // "avatar/oWbQCMCSjFi1YDw40IrtM", 이상함
        "avatar/FFylVoOKdnS7_XBJLj9uW",
        "avatar/R_phIf3x4NbmbrCk0umNV",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }
  }

  return null;
};

export const getFixedBgKey = ({ place }) => {
  if (IS_GENERATE_BG) {
    return null;
  }

  if (place === Place.cafe) {
    const items = [
      "background/_a0UvKMcaXZkciX4LhTaA",
      "background/dEouTznZKeQh82xTsJF2k",
      "background/fvjw6uRj9oTRw-GB1bBn-",
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.movie) {
    const items = [
      "background/avmjEduqtWZnR0s-TeBnv",
      "background/CS87PTR7V9PRBO3Nhx_LA",
      "background/KXx9u8THqTRNXSkCi5qYS",
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.restaurant) {
    const items = [
      "background/d1SM8vFzgqfOS6V3sF_TF",
      "background/J1KonKRJ6c7M9WdB0PnZR",
      "background/_fhcoCVQB5gPzc7bIlHWx",
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  return null;
};
