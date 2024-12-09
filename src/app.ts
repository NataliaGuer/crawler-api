import express from "express";
import bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import * as amqp from "amqplib";
import axios from "axios";

const port = 3000;
const app = express();
app.use(bodyParser.json());

// const io = new Server(createServer(app));

// io.on("connection", (socket) => {
//   console.log("user connected");
// });

const queueConnectionPromise = amqp.connect(process.env.MESSAGE_QUEUE);

/*
amqp.connect(process.env.MESSAGE_QUEUE).then((connection) => {
  connection.createChannel().then((channel) => {
    // channel.assertQueue(pushQueue).then(() => {
    //   channel.sendToQueue(pushQueue, Buffer.from(JSON.stringify(firstJob)));
    // });

    channel.assertQueue(pullQueue).then(() => {
      channel.consume(pullQueue, (msg) => {
        const msgContent = JSON.parse(msg.content.toString());

        prisma.site_info
          .findFirst({
            where: {
              url: msgContent["url"],
            },
          })
          .then((job) => {
            if (!job) {
              //se il job non è stato trovato allora inseriamo il messaggio in coda
              channel.sendToQueue(pushQueue, Buffer.from(msg.content.toString()));
            }
          });
      });
    });
  });
});
*/

app.post("/api/jobs", async (req: Request, res: Response, next: NextFunction) => {
  // alla ricezione di una richiesta in post: controlla che l'url sia esistente e
  // lo inserisce il job nella coda, restituisce 202
  // se l'url non esiste restituisce 404
  const requestUrl = req.body?.url;
  if (!requestUrl) {
    res.status(400).send();
    console.log("no url found");

    return;
  }

  const url = new URL(requestUrl);

  //controllo esistenza url
  let job = null;
  axios
    .get(url.href)
    .then((res) => {
      if (res.status === 200) {
        console.log("ok resource found");

        job = { host: url.host, url: url };
      }
    })
    .catch((err) => {
      console.log(err);
    });

  if (!job) {
    console.log("error");

    res.status(404).send();
    return;
  }

  const brokerQueue = process.env.BROKER_QUEUE;
  queueConnectionPromise.then((connection) => {
    connection.createChannel().then((channel) => {
      channel.assertQueue(brokerQueue).then(() => {
        channel.sendToQueue(brokerQueue, Buffer.from(JSON.stringify(job)));
      });
    });
  });

  res.send(url);
});

app.get("/api/jobs/:jobId", (req, res) => {
  res.send({ jobId: req.params.jobId + 5});
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
