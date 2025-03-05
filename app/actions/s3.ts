import { s3BaseUrl as S3_BASE_URL } from "@/constants";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// S3 클라이언트 초기화
export const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3({
  type,
  buffer,
  contentType = "image/png",
}: {
  type: "avatar" | "background";
  buffer: Buffer;
  contentType?: string;
}) {
  const id = nanoid();
  const key = `${type}/${id}`;

  const uploadParams = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
    Key: `${key}.png`,
    Body: buffer,
    ContentType: contentType,
  };

  // S3에 파일 업로드
  await s3Client.send(new PutObjectCommand(uploadParams));
  const url = `${S3_BASE_URL}/${key}`;

  return {
    url,
    key,
  };
}

export function getS3Url(key: string) {
  return `${S3_BASE_URL}/${key}.png`;
}
