import { getLastRagChain } from "./getLastRagChain";
import { saveQdrant } from "./saveQdrant";

const run = async () => {
  await saveQdrant();
  const ragChain = await getLastRagChain();

  const res = await ragChain.invoke({
    question: "能否给我简单描述一下这个故事？",
  });
  console.log(res);
};
run();
