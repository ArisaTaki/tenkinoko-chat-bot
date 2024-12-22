import { createSummaryPrompt } from "../../prompt-template/conversation-summary-template";
import { RunnableSequence } from "@langchain/core/runnables";
import { createChatModel } from "../../model/openai/chat-model";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const getConversationSummaryChain = async () => {
  const model = await createChatModel();
  const prompt = createSummaryPrompt();

  const conversationSummaryChain = RunnableSequence.from([
    {
      human_message: (input) => input.humanMessage,
      ai_message: (input) => input.aiMessage,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return conversationSummaryChain;
};
