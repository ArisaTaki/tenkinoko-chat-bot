import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { loadQdrant } from "../../db/loadQdrant";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { createChatModel } from "../../model/openai/chat-model";

export const getContextRetrieverChain = async () => {
  const convertDocsToString = (documents: Document[]): string => {
    return documents.map((doc) => doc.pageContent).join("\n");
  };

  const vectorStore = await loadQdrant();

  // 这里是模型的创建
  const model = await createChatModel();

  // 这里是多次查询的检索器，把用户的输入改成多个不同的写法
  const multiQueryRetriever = MultiQueryRetriever.fromLLM({
    llm: model,
    retriever: vectorStore.asRetriever(3),
    queryCount: 3,
  });

  // 专门提取核心内容的Compressor
  const compressor = LLMChainExtractor.fromLLM(model);

  // 这里是上下文压缩检索器，把用户的输入压缩成一个问题
  const compressionRetriever = new ContextualCompressionRetriever({
    baseRetriever: multiQueryRetriever,
    baseCompressor: compressor,
  });

  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.question,
    compressionRetriever,
    convertDocsToString,
  ]);

  return contextRetrieverChain;
};
