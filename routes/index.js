var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/notify', function (req, res, next) {
  // req.headers.authorization
  let tx = {
    "trxId": "",
    "bankCd":"",
    "account":"",
    "sender":"",
    "amount":100,
    "trxDay":"20211010",
    "trxTime":"",
  }
  console.log(req.body);
  res.sendStatus(200);
});

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
