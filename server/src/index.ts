import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("connected:", socket.id);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`server on :${PORT}`));
