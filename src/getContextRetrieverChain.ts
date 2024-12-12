import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { loadQdrant } from "./loadQdrant";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { createModel } from "./createModel";

export const getContextRetrieverChain = async () => {
  const convertDocsToString = (documents: Document[]): string => {
    return documents.map((doc) => doc.pageContent).join("\n");
  };

  const vectorStore = await loadQdrant();

  const model = await createModel();

  const multiQueryRetriever = MultiQueryRetriever.fromLLM({
    llm: model,
    retriever: vectorStore.asRetriever(3),
    queryCount: 3,
  });

  const compressor = LLMChainExtractor.fromLLM(model);

  const compressionRetriever = new ContextualCompressionRetriever({
    baseRetriever: multiQueryRetriever,
    baseCompressor: compressor,
  });

  //   const scoreThresholdRetriever = ScoreThresholdRetriever.fromVectorStore(
  //     vectorStore,
  //     {
  //       minSimilarityScore: 0.3,
  //       maxK: 5,
  //       kIncrement: 1,
  //     }
  //   );

  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.question,
    compressionRetriever,
    convertDocsToString,
  ]);

  return contextRetrieverChain;
};
