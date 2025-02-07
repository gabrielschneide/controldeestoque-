const express = require('express');
const request = require('request');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/proxy', (req, res) => {
  const url = 'https://script.google.com/macros/s/AKfycbxM8yhoC_oc5Acwm1FER3BeVO_G_XFtLcTudeZCnBiGpBUOvwNQUYH98db2r7qdvuKEVw/exec';
  const method = req.method;

  const options = {
    uri: url,
    method: method,
    json: true,
    body: req.body,
    qs: req.query
  };

  req.pipe(request(options)).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
