const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const options = {
    key: fs.readFileSync('path/to/key.pem'),
    cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443); 