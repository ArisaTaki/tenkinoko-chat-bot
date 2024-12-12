import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

export const loadQdrant = async () => {
  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });

  // 加载 Qdrant 中已存储的集合
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client: client,
      collectionName: "ten_ki_no_ko",
    }
  );

  return vectorStore;
};
