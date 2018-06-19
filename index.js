const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');

const config = require('./config');
const spotifyRoute = require('./spotify');

const app = express();
app.use(bodyParser.json());

spotifyRoute(app);

app.post('/errors', function(req, res) {
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/',function(req, res) {
  fs.readFile("public/index.html", function (error, pgResp) {
    if (error) {
        res.writeHead(404);
        res.write('Contents you are looking are Not Found');
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(pgResp);
    }
    res.end();
  });
});

app.get('/public/Spotify.png',function(req, res) {
  fs.readFile("public/Spotify.png", function (error, pgResp) {
    if (error) {
        res.writeHead(404);
        res.write('Contents you are looking are Not Found');
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(pgResp);
    }
    res.end();
  });
});

const port = config.PORT;
app.listen(port, function() {
  console.log(`App is listening on port ${port}`);
});
