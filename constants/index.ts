import { IMAGES } from "@/asset/images";

// 이미지 데이터
export const IMAGE_LIST = [
  { id: "iu", url: IMAGES.iu },
  { id: "vee", url: IMAGES.vee },
] as const;

export type Character = (typeof IMAGE_LIST)[number]["id"];

export const Place = {
  restaurant: "restaurant",
  cafe: "cafe",
  movie: "movie",
} as const;

export type Place = (typeof Place)[keyof typeof Place] | string;

// Expanded type that allows any string

// Update your places array type
export type PlaceItem = {
  id: Place; // Now accepts any string
  label: string;
  isCustom: boolean;
};

// 장소 데이터
export const PLACES: PlaceItem[] = [
  { id: Place.restaurant, label: "식당", isCustom: false },
  { id: Place.cafe, label: "카페", isCustom: false },
  { id: Place.movie, label: "영화관", isCustom: false },
];

export const LEVELS = [1, 2, 3, 4, 5];

export const placeInfoMap: Record<
  Place,
  { place: string; situation: string; assistantRole: string }
> = {
  [Place.restaurant]: {
    place: "식당",
    situation: "주문하기",
    assistantRole: "식당 직원",
  },
  [Place.cafe]: {
    place: "카페",
    situation: "주문하기",
    assistantRole: "카페 직원",
  },
  [Place.movie]: {
    place: "영화관",
    situation: "영화 예매하기",
    assistantRole: "영화관 직원",
  },
};

export const characterInfoMap: Record<
  Character,
  {
    gender: "female" | "male";
    name: string;
  }
> = {
  vee: {
    gender: "male",
    name: "뷔",
  },
  iu: {
    gender: "female",
    name: "아이유",
  },
};

export const firstUserMsg = "대화를 시작해줘";

// 장소 데이터
export const examplePrompt = `
**Example 1:**
- Role: 카페 직원
- User: "안녕하세요, 커피 한 잔 주세요."
- assistant: "안녕하세요! 어떤 커피로 드릴까요? 에스프레소, 아메리카노, 라떼 중에 선택하실 수 있습니다."

**Example 2:**
- Role: RPG 게임 상의 상인
- User: "안녕하세요, 이번에 새로 나온 무기 좀 보여주세요."
- assistant: "안녕하세요! 요즘 인기 있는 광선검과 마법의 활이 있습니다. 어떤 무기를 찾고 계신가요?"

**Example 3:**
- 상황: 시장에서 대화, 시장에 도착하면서
- Role: 친구

- User: 와, 시장에 사람이 정말 많네!
- assistant: 응, 여기 전통 시장이라서 신선한 재료도 많고 가격도 싸!
- User: 신선한 채소랑 고기도 파네.
- assistant: 맞아. 오늘 뭐 먹을 거야?

**Example 4:**
- 상황: 식당에서 대화, 식당에 도착하면서
- Role: 친구

- User: 여기가 맛집이야?
- assistant: 응, 여기 김치찌개 진짜 맛있어!
- User: 기대된다!

**Example 5:**
- 상황: 식당에서 대화, 메뉴 확인 & 주문
- Role: 식당 직원

- assistant: 어서 오세요! 주문하시겠어요?
- User: 네, 김치찌개 하나 주세요!
- assistant: 네, 알겠습니다!

**Example 6:**
- 상황: 식당에서 대화, 음식이 나왔을 때
- Role: 친구

- User: 와, 진짜 맛있어 보여!
- assistant: 어서 먹어 봐!
- User: (한 입 먹고) 음~ 진짜 맛있다!
- assistant: 그렇지? 여기는 항상 맛있어!

**Example 7:**
- 상황: 식당에서 대화, 식사 후 마무리 대화
- Role: 친구

- User: 배부르다~!
- assistant: 나도! 이제 커피 마시러 갈까?
- User: 좋아! 가자!
`.trim();

export const s3BaseUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;
