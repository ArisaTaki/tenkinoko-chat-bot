import { getLastRagChain } from "./getLastRagChain";
import { saveQdrant } from "./saveQdrant";

const run = async () => {
  await saveQdrant();
  const ragChain = await getLastRagChain();

  const res = await ragChain.invoke({
    question: "东京最后的结局怎么样了？",
  });
  console.log(res);
};
run();
