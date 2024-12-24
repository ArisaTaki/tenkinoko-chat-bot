import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrantWithFilter } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/saveQdrant";
import { saveShortTermMemory } from "./memory/short-term-memory";
import { ruleBasedResponse } from "./pre-defined-res";

const run = async (uuidv4: string) => {
  await saveQdrant();
  const ragChain = await getLastRagChain(uuidv4);

  const question = "介绍他们俩的故事";

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

  saveShortTermMemory(question, res, uuidv4);

  await saveMemoryToQdrantWithFilter(
    {
      humanMessage: question,
      aiMessage: res,
    },
    uuidv4
  );
};
// 从前端传过来的uuid字符串，现在先模拟一下
run("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f");
