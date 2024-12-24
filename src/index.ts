import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrantWithFilter } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/saveQdrant";
import { saveShortTermMemory } from "./memory/short-term-memory";
import { ruleBasedResponse } from "./pre-defined-res";

export const runRAG = async (uuidv4: string, question: string) => {
  await saveQdrant();
  const ragChain = await getLastRagChain(uuidv4);

  // Step 1: 规则引擎优先响应
  const ruleResponse = ruleBasedResponse(question);
  if (ruleResponse) {
    console.log("规则引擎回答：", ruleResponse);
    return; // 如果匹配规则，直接返回答案
  }

  // Step 2: 调用 RAG 模型
  const res = await ragChain.invoke({
    question,
  });

  await saveShortTermMemory(question, res, uuidv4);

  await saveMemoryToQdrantWithFilter(
    {
      humanMessage: question,
      aiMessage: res,
    },
    uuidv4
  );

  return res;
};
