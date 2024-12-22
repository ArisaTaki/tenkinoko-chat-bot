import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrant } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/saveQdrant";
import { saveShortTermMemory } from "./memory/short-term-memory";

const run = async () => {
  await saveQdrant();
  const ragChain = await getLastRagChain();

  const question = "你好，我是谁？";

  const res = await ragChain.invoke({
    question,
  });

  console.log(res);

  saveShortTermMemory(question, res);

  await saveMemoryToQdrant({
    humanMessage: question,
    aiMessage: res,
  });
};
run();
