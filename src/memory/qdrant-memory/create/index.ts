// createMemoryFromQdrant.ts
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { createEmbeddingsModel } from "../../../model/openai/embeddings-model";

import "dotenv/config";

export const createMemoryFromQdrant = async (uuidv4: string) => {
  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  // 检查集合是否存在
  const collectionName = "ten_ki_no_ko_history";
  try {
    await client.getCollection(collectionName);
  } catch (error: any) {
    if (error?.status === 404) {
      // 集合不存在时创建
      await client.createCollection(collectionName, {
        vectors: {
          size: 1536, // 根据嵌入向量维度调整
          distance: "Cosine",
        },
      });
    } else {
      throw error; // 重新抛出其他错误
    }
  }

  await client.createPayloadIndex(collectionName, {
    field_name: "uuidv4",
    field_schema: "keyword",
  });

  const embeddings = await createEmbeddingsModel();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client: client,
      collectionName,
    }
  );

  const memory = new VectorStoreRetrieverMemory({
    vectorStoreRetriever: vectorStore.asRetriever({
      k: 2,
      filter: {
        must: [{ key: "metadata.uuidv4", match: { value: uuidv4 } }],
      },
    }),
    memoryKey: collectionName,
    metadata: { uuidv4 },
  });

  return memory;
};
