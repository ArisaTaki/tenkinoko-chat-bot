import { parseJudgmentResult, isImportantMessage } from "../../../helper";
import { getMemoryJudgmentChain } from "../../../chains/memory-judgment-chain";
import { createMemoryFromQdrant } from "../create";

export interface Memory {
  humanMessage: string;
  aiMessage: string;
}

export const saveMemoryToQdrantWithFilter = async (messages: Memory) => {
  const judgmentChain = await getMemoryJudgmentChain();

  if (!isImportantMessage(messages.humanMessage)) {
    console.log(
      "对话被判断为不需要存入长期记忆。原因：寒暄或常见问题，已被提前筛除。"
    );
    return;
  } else {
    // 调用判断链
    const judgmentResult = await judgmentChain.invoke({
      humanMessage: messages.humanMessage,
      aiMessage: messages.aiMessage,
    });

    const result = parseJudgmentResult(judgmentResult);

    console.log("AI 判断结果：", result);

    // 判断是否需要存入长期记忆
    if (result.important) {
      const memory = await createMemoryFromQdrant();
      await memory.saveContext(
        { input: messages.humanMessage },
        { output: messages.aiMessage }
      );
      console.log("重要对话已存入长期记忆。原因：", result.reason);
    } else {
      console.log("对话被判断为不需要存入长期记忆。原因：", result.reason);
    }
  }
};
