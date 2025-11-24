export default {
  port: 3003,
  async fetch(req) {
    console.log('HTTP/3 QUIC request');
    return new Response('Hello from HTTP/3 (QUIC)');
  },
};
