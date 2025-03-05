/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ai-hackathon-kunchams.s3.ap-northeast-2.amazonaws.com",
        pathname: "/**", // 모든 경로를 허용
      },
    ],
  },
};

export default nextConfig;
