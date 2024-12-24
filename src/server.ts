import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runRAG } from "./index";

const app = express();
const port = 3000;

// 中间件
app.use(bodyParser.json());
app.use(cors());

app.post("/api/run-rag", async (req: Request, res: Response) => {
  const { uuidv4, question } = req.body;

  if (!uuidv4 || !question) {
    res
      .status(400)
      .json({ error: "Missing uuidv4 or question in request body." });
    return;
  }

  // 设置响应头，保持流式连接
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders();

  try {
    await runRAG(
      uuidv4,
      question,
      (chunk: string) => {
        // 回调：每次有新数据时写入响应
        res.write(chunk);
      },
      () => {
        // 回调：流完成时关闭连接
        res.end();
      },
      (error: Error) => {
        // 回调：发生错误时记录错误并关闭连接
        console.error("Error in RAG:", error);
        res.write(`Error: ${error.message}`);
        res.end();
      }
    );
  } catch (error) {
    console.error("Error initializing RAG:", error);
    res.status(500).end("Internal server error.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
