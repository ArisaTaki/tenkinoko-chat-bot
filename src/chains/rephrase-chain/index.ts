import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { rephraseTemplate } from "../../prompt-template/rephrase-template";
import { createChatModel } from "../../model/openai/chat-model";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getShortTermMemory } from "../../memory/short-term-memory";

export const getRephraseChain = async (uuidv4: string) => {
  const short_memory = await getShortTermMemory(uuidv4);

  const model = await createChatModel(0.2);
  const rephraseChain = RunnableSequence.from([
    (input) => input,
    RunnablePassthrough.assign({
      history: () => {
        return !!short_memory ? short_memory : "暂无历史记录";
      },
      question: (input) => {
        return input;
      },
    }),
    rephraseTemplate(),
    model,
    new StringOutputParser(),
  ]);

  return rephraseChain;
};
