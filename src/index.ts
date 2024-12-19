import { getLastRagChain } from "./chains/last-rag-chain";
import { saveMemoryToQdrant } from "./memory/qdrant-memory/save";
import { saveQdrant } from "./db/save";
import { saveShortTermMemory } from "./memory/short-term-memory";

const run = async () => {
  await saveQdrant();
  const ragChain = await getLastRagChain();

  const question = "我的名字叫什么？你会怎么给我推荐这本书？";

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
