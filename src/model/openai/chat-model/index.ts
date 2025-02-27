import { ChatOpenAI } from "@langchain/openai";
import { MODEL_CONFIG } from "../../../utils/config";
import logger from "../../../utils/logger";

export const createChatModel = async (temperature?: number) => {
  try {
    logger.debug(`创建聊天模型: ${MODEL_CONFIG.OPENAI_MODEL}`);

    const model = new ChatOpenAI({
      configuration: {
        baseURL: MODEL_CONFIG.OPENAI_API_URL,
      },
      model: MODEL_CONFIG.OPENAI_MODEL,
      temperature: temperature || MODEL_CONFIG.DEFAULT_TEMPERATURE,
      verbose: true,
    });

    return model;
  } catch (error) {
    logger.error("创建聊天模型失败", error);
    throw error;
  }
};
