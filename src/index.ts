import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrantWithFilter } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/saveQdrant";
import { saveShortTermMemory } from "./memory/short-term-memory";
import { ruleBasedResponse } from "./pre-defined-res";

export const runRAG = async (
  uuidv4: string,
  question: string,
  onData: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  try {
    await saveQdrant();
    const ragChain = await getLastRagChain(uuidv4);

    // Step 1: 规则引擎优先响应
    const ruleResponse = ruleBasedResponse(question);
    if (ruleResponse) {
      onData(`规则引擎回答：${ruleResponse}\n`);
      onComplete();
      return;
    }

    // Step 2: 调用 RAG 模型
    const streamResult = await ragChain.stream({ question });

    let res = "";

    // 流式处理每个数据块
    for await (const chunk of streamResult) {
      res += chunk;
      onData(chunk); // 逐块传递数据
    }
    // 完成流式传递
    onComplete();
    // 保存记忆
    await saveShortTermMemory(question, res, uuidv4);
    await saveMemoryToQdrantWithFilter(
      {
        humanMessage: question,
        aiMessage: res,
      },
      uuidv4
    );
  } catch (error) {
    if (error instanceof Error) {
      // 明确将 error 类型传递给 onError
      onError(error);
    } else {
      // 如果 error 不是 Error 类型，创建一个新的 Error 实例
      onError(new Error(String(error)));
    }
  }
};
