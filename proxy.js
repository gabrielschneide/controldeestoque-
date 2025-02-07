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
  const url = 'https://script.google.com/macros/s/AKfycbxx2F-jmiZPokvA3_KZwo3mVM_BRi1tMOPT1Sk6T5sPEPpCySyU5Wcuahx_mA3fnb20Qw/exec';
  req.pipe(request({ qs: req.query, uri: url })).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
