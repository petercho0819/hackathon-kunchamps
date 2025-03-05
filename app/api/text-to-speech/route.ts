import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  try {
    const { language, text } = await request.json();
    
    // Replicate API 호출
    if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
      throw new Error('API token not configured');
    }
    
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
    });
    
    const output :unknown = await replicate.run(
      "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
      {
        input: {
          text,
          speaker: "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav",
          language,
          cleanup_voice: false
        }
      }
    );  

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const url = await output?.url();
    
    return NextResponse.json({ success: true, audioUrl:url.href });
    
  } catch (error) {
    console.error('Error processing voice input:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process voice input' },
      { status: 500 }
    );
  }
}