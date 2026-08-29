const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Proxy running');
});

server.listen(3001, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3001');
});
