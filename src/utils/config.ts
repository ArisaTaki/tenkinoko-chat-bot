import dotenv from "dotenv";
import path from "path";

// 加载环境变量
dotenv.config();

// 服务器配置
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "localhost",
};

// 内存配置
export const MEMORY_CONFIG = {
  // 短期内存保留的最大对话数量
  SHORT_TERM_MEMORY_MAX_COUNT: 5,
  // 长期内存配置
  QDRANT_URL: process.env.QDRANT_API_URL || "http://localhost:6333",
  // 内存判断阈值
  IMPORTANCE_THRESHOLD: 0.6,
};

// 模型配置
export const MODEL_CONFIG = {
  OPENAI_API_URL: process.env.OPENAI_API_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  OPENAI_EMBEDDING_MODEL:
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002",
  // 默认温度
  DEFAULT_TEMPERATURE: 0.7,
};

// 路径配置
export const PATH_CONFIG = {
  // 日志目录
  LOG_DIR: path.join(__dirname, "../../logs"),
  // 数据目录
  DATA_DIR: path.join(__dirname, "../../data"),
};

// 其他配置
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: "tenkinoko-chat-bot",
  // 版本
  VERSION: "1.0.0",
};
