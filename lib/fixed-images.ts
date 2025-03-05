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
        "avatar/jEseBDi6vE0kkLqyIx4BQ",
        "avatar/gVFhOQs2O8hdrB-gtCXY3",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.movie) {
      const items = [
        "avatar/kth3h_K7IldVotdtgcXm5",
        "avatar/RY49RpHNnQRQOLyJHCQ7D",
        "avatar/v_NHSIVgh7i8_45k66ml3",
        "avatar/NNb56JmtAspG3gg5mg8Zx",
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }

    if (place === Place.restaurant) {
      const items = [
        "avatar/XHhRpX8TFOW_-IImObBIe",
        "avatar/KAasRbKwB7UW12bxORCEb",
        "avatar/hunWfXtfs4pNKlSryatgt",
        "avatar/oWbQCMCSjFi1YDw40IrtM",
        "avatar/FFylVoOKdnS7_XBJLj9uW",
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
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.movie) {
    const items = [
      "background/avmjEduqtWZnR0s-TeBnv",
      "background/CS87PTR7V9PRBO3Nhx_LA",
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.restaurant) {
    const items = [
      "background/d1SM8vFzgqfOS6V3sF_TF",
      "background/J1KonKRJ6c7M9WdB0PnZR",
    ];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  return null;
};
