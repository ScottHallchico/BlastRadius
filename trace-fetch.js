const https = require('https');

https.get('https://github.com/expressjs/express', (res) => {
  console.log('statusCode:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
