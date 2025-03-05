import originalAxios from "axios";

const apiAxios = originalAxios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json", // 기본 헤더 설정
  },
});

export default apiAxios;
