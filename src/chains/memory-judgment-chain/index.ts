import { createMemoryJudgmentTemplate } from "../../prompt-template/memory-judgment-template";
import { RunnableSequence } from "@langchain/core/runnables";
import { createChatModel } from "../../model/openai/chat-model";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const getMemoryJudgmentChain = async () => {
  const model = await createChatModel();
  const prompt = createMemoryJudgmentTemplate();

  const judgmentChain = RunnableSequence.from([
    {
      human_message: (input) => input.humanMessage,
      ai_message: (input) => input.aiMessage,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return judgmentChain;
};
