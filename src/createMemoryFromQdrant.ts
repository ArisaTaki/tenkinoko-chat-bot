// createMemoryFromQdrant.ts
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

export const createMemoryFromQdrant = async () => {
  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });

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
