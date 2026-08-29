const https = require('http');

const data = JSON.stringify({
  changeDescription: "Modify the Button component API so that the existing Button component changes the type of its onClick prop.",
  repoUrl: "/home/boypablo/openui"
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  });
});

req.write(data);
req.end();
