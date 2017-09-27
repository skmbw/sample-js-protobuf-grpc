import path from 'path';
import grpc from 'grpc';

const myapp_proto = grpc.load(
  path.resolve(path.dirname(''), 'protos', 'service.proto')
).myapp;
const client = new myapp_proto.MyApp('127.0.0.1:50051', grpc.credentials.createInsecure());
client.listMessages(
  1,
  (err, res) => console.log(res),
);
