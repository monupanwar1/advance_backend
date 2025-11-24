import http from 'http';

const server = http.createServer((req, res) => {
  console.log('HTTP/1.1 request received');

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from HTTP/1.1');
});

server.listen(3001, () => {
  console.log('HTTP/1.1 server → http://localhost:3001');
});
