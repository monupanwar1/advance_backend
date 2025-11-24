// const http = require('http');

// let todos = ['Learn Node'];
// const etag = `"todo-v1"`;

// const server = http.createServer(async (req, res) => {
//   // Set a cookie
//   res.setHeader('Set-Cookie', 'user=kunalPanwar; HttpOnly');

//   // ETag support
//   if (req.headers['if-none-match'] === etag && req.method === 'GET') {
//     res.writeHead(304);
//     return res.end();
//   }

//   // GET /todos → show all todos
//   if (req.method === 'GET' && req.url === '/todos') {
//     res.writeHead(200, {
//       'Content-Type': 'application/json',
//       'ETag': etag,
//     });
//     return res.end(JSON.stringify({ todos }));
//   }

//   // POST /todos → add todo
//   if (req.method === 'POST' && req.url === '/todos') {
//     let body = '';
//     req.on('data', (chunk) => (body += chunk));
//     req.on('end', () => {
//       const data = JSON.parse(body);
//       todos.push(data.text); // add todo

//       res.writeHead(201, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ message: 'Todo added', todos }));
//     });
//     return;
//   }

//   // DELETE /todos/:id
//   if (req.method === 'DELETE' && req.url.startsWith('/todos/')) {
//     const id = parseInt(req.url.split('/')[2]); // index
//     todos.splice(id, 1);

//     res.writeHead(204); // no content
//     return res.end();
//   }

//   // Default 404
//   res.writeHead(404);
//   res.end('Not Found');
// });

// server.listen(3000, () => {
//   console.log('TODO API running at http://localhost:3000');
// });

import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';

const app = express();

app.use(express.json());

// method

// GET -> 200
app.get('/hello', (req, res) => {
  res.status(200).send('GET → 200 OK');
});
app.post('/hello', (req, res) => {
  res.status(201).send('POST → 201 Created');
});

app.delete('/hello', (req, res) => {
  res.status(204).send();
});

app.get('/headers', (req, res) => {
  res.set('X-Learning', 'HeadersAreCool');
  res.status(200).send('Custom header sent!');
});

// cookies
app.get('/set-cookie', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    'sessionId=abc123; HttpOnly; SameSite=Strict; Max-Age=3600',
  );
  res.status(200).send('Cookie has been set!');
});

const resource = {
  id: 1,
  content: 'This is cached content!',
};
const body = JSON.stringify(resource);

const ETag = `"${crypto.createHash('md5').update(body).digest('hex')}"`;

app.get('/etag', (req, res) => {
  res.set('ETag', ETag);

  if (req.headers['if-none-match'] === ETag) {
    return res.status(304).send();
  }

  res.status(200).json(resource);
});

const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;

// Start HTTPS if certificate files exist
if (fs.existsSync('key.pem') && fs.existsSync('cert.pem')) {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server → https://localhost:${HTTPS_PORT}`);
  });
}

// Always start HTTP
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP Server → http://localhost:${HTTP_PORT}`);
});
