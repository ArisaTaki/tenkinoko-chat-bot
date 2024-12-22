import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrantWithFilter } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/saveQdrant";
import { saveShortTermMemory } from "./memory/short-term-memory";
import { ruleBasedResponse } from "./pre-defined-res";

const run = async () => {
  await saveQdrant();
  const ragChain = await getLastRagChain();

  const question = "《天气之子》是关于什么的？";

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

  console.log(res);

  saveShortTermMemory(question, res);

  await saveMemoryToQdrantWithFilter({
    humanMessage: question,
    aiMessage: res,
  });
};
run();
