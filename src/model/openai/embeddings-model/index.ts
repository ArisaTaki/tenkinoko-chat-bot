import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

export const createEmbeddingsModel = async () => {
  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });
  return embeddings;
};
