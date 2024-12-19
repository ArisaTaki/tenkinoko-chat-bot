import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

export const createChatModel = async () => {
  const model = new ChatOpenAI({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_MODEL,
  });
  return model;
};
