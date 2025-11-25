import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import copilotkitRouter from "./routes/copilotkit";
dotenv.config();

const app = express();

// 中间件
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use("/api/copilotkit", copilotkitRouter);
// 其他路由的 JSON 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(config.port, () => {
  console.log(`🚀 Express Chat AI Backend 已启动`);
  console.log(`📡 服务地址: http://localhost:${config.port}`);
});