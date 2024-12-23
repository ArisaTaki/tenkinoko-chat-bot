import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

export const createChatModel = async (temperature?: number) => {
  const model = new ChatOpenAI({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_MODEL,
    temperature: temperature || 0.7,
    verbose: true,
  });
  return model;
};
