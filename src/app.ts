import express from "express";
import bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const port = 3000;
const app = express();
app.use(bodyParser.json());

const io = new Server(createServer(app));

io.on("connection", (socket) => {
  console.log("user connected");
});

app.post("/api/jobs", async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  res.send(body);
});

app.get("/api/jobs/:jobId", (req, res) => {
  res.send({ jobId: req.params.jobId });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
