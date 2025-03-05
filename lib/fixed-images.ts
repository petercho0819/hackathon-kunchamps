import { Place } from "@/constants";

export const getFixedAvataKey = ({ place, character }) => {
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
      ];

      const ranIndx = Math.floor(Math.random() * items.length);

      return items[ranIndx];
    }
  }

  return null;
};

export const getFixedBgKey = ({ place }) => {
  if (place === Place.cafe) {
    const items = [""];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.movie) {
    const items = ["/images/vee-home"];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  if (place === Place.restaurant) {
    const items = ["/images/vee-home"];

    const ranIndx = Math.floor(Math.random() * items.length);

    return items[ranIndx];
  }

  return null;
};
