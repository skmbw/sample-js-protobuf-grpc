import path from 'path';
import http from 'http';
import express from 'express';
import protobuf from 'protobufjs';

const app = express();
const staticDir = 'static';
const port = 5000;

app.use(express.static(staticDir));

app.get('/api/messages', (req, res) => {
  const payload = {
    messages: [
      { text: 'hey', lang: 'english' },
      { text: 'よう', lang: 'japanese' },
    ]
  };
  const root = protobuf
    .loadSync(
      path.resolve(path.dirname(''), 'protos', 'message.proto')
    );
  const MessageList = root.lookupType('myapp.MessageList');

  const err = MessageList.verify(payload);
  if (err) throw Error(err);

  const messages = MessageList.create(payload);
  const buffer = MessageList.encode(messages).finish();

  res.status(200).send(buffer);
});

app.post('/api/messages', (req, res, next) => {
  if (!req.is('application/octet-stream')) return next();

  var data = [];
  req.on('data', chunk => data.push(chunk));
  req.on('end', () => {
    const buffer = Buffer.concat(data);

    const root = protobuf
      .loadSync(
        path.resolve(path.dirname(''), 'protos', 'message.proto')
      );
    const Message = root.lookupType('myapp.Message');

    const message = Message.decode(buffer);
    const obj = Message.toObject(message);

    console.log(obj);

    res.status(200).json(obj);
  });
});

app.use('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Sample App Using Protocol Buffer</title>
    </head>
    <body>
      <button id="fetch" type="button">Fetch</button>
      <hr />
      <button id="save" type="button">Save</button>
      <hr />
      <div id="log"></div>
      <script src="/index.js"></script>  
    </body>
    </html>
  `);
});

const server = http.createServer(app);

function onListening() {
  console.log(`Listening on ${port}`);
}

server.listen(port);
server.on('listening', onListening);
