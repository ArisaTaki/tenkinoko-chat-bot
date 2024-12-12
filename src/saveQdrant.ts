import { QdrantClient } from "@qdrant/js-client-rest";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

export const saveQdrant = async () => {
  const loader = new TextLoader("../data/天气之子.txt");

  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 100,
    chunkSize: 500,
  });

  const client = new QdrantClient({ url: process.env.QDRANT_API_URL });

  const collectionName = "ten_ki_no_ko";

  // 检查是否存在目标 collection
  const collectionExists = async (
    client: QdrantClient,
    collectionName: string
  ) => {
    try {
      await client.getCollection(collectionName);
      console.log(`Collection "${collectionName}" already exists.`);
      return true;
    } catch (error) {
      if ((error as any)?.status === 404) {
        console.log(`Collection "${collectionName}" does not exist.`);
        return false;
      }
      throw error;
    }
  };

  const exists = await collectionExists(client, collectionName);

  if (exists) {
    console.log(
      "Skipping writing to the database since the collection exists."
    );
    return;
  }

  console.log(
    "Collection does not exist. Proceeding to write to the database."
  );

  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new OpenAIEmbeddings({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });

  await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
    client: client,
    collectionName: collectionName,
  });

  console.log("Data has been successfully written to the database.");
};
