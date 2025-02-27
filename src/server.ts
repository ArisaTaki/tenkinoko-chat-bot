import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runRAG } from "./index";
import logger from "./utils/logger";
import { SERVER_CONFIG } from "./utils/config";

const app = express();
const { PORT, HOST } = SERVER_CONFIG;

// 中间件
app.use(bodyParser.json());
app.use(cors());

// 添加API路由
app.post("/api/run-rag", (req: Request, res: Response) => {
  const { uuidv4, question } = req.body;

  if (!uuidv4 || !question) {
    logger.warn("API请求缺少uuidv4或question参数");
    return res
      .status(400)
      .json({ error: "Missing uuidv4 or question in request body." });
  }

  // 设置响应头
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("X-Accel-Buffering", "no"); // 禁用Nginx缓冲

  let hasError = false;

  // 使用Promise处理异步操作
  runRAG(
    uuidv4,
    question,
    (chunk: string) => {
      // 回调：每次有新数据时写入响应
      if (!hasError && !res.headersSent) {
        res.write(chunk);
      }
    },
    () => {
      // 回调：流完成时关闭连接
      if (!hasError) {
        res.end();
      }
    },
    (error: Error) => {
      // 回调：发生错误时记录错误并关闭连接
      hasError = true;
      logger.error("RAG处理过程中出错:", error);
      res.status(500).send(`Error: ${error.message}`);
    }
  ).catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("初始化RAG时出错:", { error: errorMessage });
    if (!res.headersSent) {
      res.status(500).send("Internal server error.");
    }
  });
});

app.listen(PORT, () => {
  logger.info(`服务器已在 http://${HOST}:${PORT} 启动`);
});
