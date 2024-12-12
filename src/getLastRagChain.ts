import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getContextRetrieverChain } from "./getContextRetrieverChain";
import { createTemplate } from "./creatTemplate";

export const getLastRagChain = async () => {
  const model = new ChatOpenAI({
    configuration: {
      baseURL: process.env.OPENAI_API_URL,
    },
    model: process.env.OPENAI_MODEL,
  });

  const contextRetriverChain = await getContextRetrieverChain();

  const prompt = createTemplate();

  const ragChain = RunnableSequence.from([
    {
      context: contextRetriverChain,
      question: (input) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return ragChain;
};
