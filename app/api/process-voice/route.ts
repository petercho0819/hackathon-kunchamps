import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Replicate from 'replicate';

// S3 클라이언트 초기화
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { audio, language } = await request.json();
    
    // base64 데이터를 Buffer로 변환
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // S3에 업로드할 파일명 생성 (타임스탬프 사용)
    const fileName = `audio-${Date.now()}.wav`;
    
    // S3 업로드 파라미터
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: fileName,
      Body: audioBuffer,
      ContentType: 'audio/wav',
    };

    // S3에 파일 업로드
    await s3Client.send(new PutObjectCommand(uploadParams));
    // S3 URL 생성
    const audioUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;

    // Replicate API 호출
    if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
      throw new Error('API token not configured');
    }

    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "openai/whisper:91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
      {
        input: {
          audio:audioUrl,
          translate: false,
          temperature: 0,
          transcription: "plain text",
          suppress_tokens: "-1",
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2
        }
      }
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    if (!output?.transcription) {
      return NextResponse.json({ 
        transcription: "NO_TRANSCRIPTION",
        audioUrl: audioUrl 
      });
    }
    return NextResponse.json({ 
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      transcription: output?.transcription,
      audioUrl: audioUrl 
    });

  } catch (error) {
    console.error('Error processing voice input:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process voice input' },
      { status: 500 }
    );
  }
}
