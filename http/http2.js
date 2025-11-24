// openssl req -new -nodes -x509 \
//   -keyout key.pem -out cert.pem

// command for cert and key

import fs from 'fs';

import http2 from 'http2';

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
});

server.on('stream', (stream, headers) => {
  console.log('HTTP/2 request received');

  stream.respond({
    'content-type': 'text/plain',
    ':status': 200,
  });

  // 👇 real multiplexing: 3 chunks sent WITHOUT waiting
  stream.write('File chunk A\n');
  stream.write('File chunk B\n');
  stream.write('File chunk C\n');
  stream.end('— HTTP/2 Done —');
});

server.listen(3002, () => {
  console.log('HTTP/2 server → https://localhost:3002');
});
