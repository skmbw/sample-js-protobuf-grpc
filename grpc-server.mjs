import path from 'path';
import grpc from 'grpc';

const myapp_proto = grpc.load(
  path.resolve(path.dirname(''), 'protos', 'service.proto')
).myapp;

const messages = [
  { text: 'hey', lang: 'english' },
  { text: 'よう', lang: 'japanese' },
];

function listMessages(call, callback) {
  var id = call.request.id;
  console.log(id);
  return callback(null, messages);
}

const server = new grpc.Server();
server.addService(
  myapp_proto.MyApp.service,
  { listMessages }
);
server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
server.start();
