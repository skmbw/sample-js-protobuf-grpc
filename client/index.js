const protobuf = require('protobufjs');

document.getElementById('fetch')
  .addEventListener('click', e => {
    e.preventDefault();
    fetchMessage();
  });

document.getElementById('save')
  .addEventListener('click', e => {
    e.preventDefault();
    saveMessage();
  });

const log = document.getElementById('log');

function fetchMessage() {
  fetch('/api/messages')
    .then(res => res.arrayBuffer())
    .then(data => {
      const buffer = new Uint8Array(data);
      return protobuf
        .load('/protos/message.proto')
          .then(root => {
            const MessageList = root.lookupType('myapp.MessageList');
            const messages = MessageList.decode(buffer);
            const obj = MessageList.toObject(messages);
            return obj
          })
      .then(obj => printLog(JSON.stringify(obj)));
    });
}

function saveMessage() {
  const headers = new Headers();

  const payload = { text: 'よう', lang: 'japanese' };
  const root = protobuf.load('/protos/message.proto')
    .then(root => {
      const Message = root.lookupType('myapp.Message');

      const err = Message.verify(payload);
      if (err) throw Error(err);

      const message = Message.create(payload);
      const buffer = Message.encode(message).finish();

      headers.append('Content-Type', 'application/octet-stream');
      fetch('/api/messages', {
        method: 'POST',
        headers,
        body: buffer,
      })
        .then(res => res.json())
        .then(obj => printLog(JSON.stringify(obj)));
  });
}

function printLog(str) {
  const mes = document.createElement('P');
  mes.innerText = str;
  log.appendChild(mes);
}
