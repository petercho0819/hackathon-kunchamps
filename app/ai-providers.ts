import OpenAI from "openai";
import Replicate from "replicate";

export const openai = new OpenAI();

export const replicate = new Replicate({
  auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
});
