import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";
import { createEmbeddingsModel } from "../../model/openai/embeddings-model";

export const loadQdrant = async () => {
  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  const embeddings = await createEmbeddingsModel();
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
