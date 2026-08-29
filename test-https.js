const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("test.tar.gz");
https.get("https://codeload.github.com/fastapi/fastapi/legacy.tar.gz/HEAD", response => {
  console.log("Status:", response.statusCode);
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download complete");
  });
}).on('error', err => {
  fs.unlink("test.tar.gz", () => {});
  console.error("Error:", err.message);
});
