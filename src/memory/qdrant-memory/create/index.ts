// createMemoryFromQdrant.ts
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { createEmbeddingsModel } from "@/model/openai/embeddings-model";
import "dotenv/config";

export const createMemoryFromQdrant = async () => {
  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  const embeddings = await createEmbeddingsModel();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client: client,
      collectionName: "ten_ki_no_ko_history",
    }
  );

  const memory = new VectorStoreRetrieverMemory({
    vectorStoreRetriever: vectorStore.asRetriever(1),
    memoryKey: "ten_ki_no_ko_history",
  });

  return memory;
};
