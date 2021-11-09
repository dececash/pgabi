var express = require('express');
const pgRpc = require('../pgrpc');
const db = require('../db');
const utils = require('../utils');
var router = express.Router();
var index = 0;

router.post('/notify', function (req, res, next) {
  // req.headers.authorization
  let tx = {
    "trxId": req.body.trxId,
    "bankCd": req.body.bankCd,
    "account": req.body.account,
    "sender": req.body.sender,
    "amount": req.body.amount,
    "createTime": req.body.trxDay + " " + req.body.trxTime
  }
  db.saveRecharge(tx, function (err) {
    res.send({
      code: "200",
      message: "ok",
    });
  });
});

router.post('/register', function (req, res, next) {
  let code = 200;
  let msg = "OK";
  try {
    let userId = utils.genUserId(req.body.pkr);
    let trackId = utils.genRTrackId(userId, Math.floor(new Date().getTime() / 1000));

    console.log(userId, trackId);
    let miniMcht = {
      "trackId": trackId,
      "userId": userId,
      "name": req.body.name,
      "taxType": req.body.taxType,
      "identity": req.body.identity,
      "phone": req.body.phone,
      "accnt": {
        "account": req.body.account,
        "bankCd": req.body.bankCd,
        "beneficiary": req.body.beneficiary
      }
    }
    console.log(miniMcht)
    //TODO test
    res.send({
      code: "200",
      message: "OK",
      data: {
        account: userId
      }
    });
    // pgRpc.register(miniMcht, function (err, data) {
    //   if (err) {
    //     res.send({
    //       code: "500",
    //       message: err,
    //     });
    //   } else {
    //     res.send({
    //       code: "200",
    //       message: "OK",
    //       data:{account:data}
    //     });
    //   }
    // })
  } catch (err) {
    console.log(err);
    // res.send({
    //   code: "500",
    //   message: err,
    // });
  }

});

router.get('/getUserInfo', function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);

  // pgRpc.getUserInfo(userId, function (err, data) {
  //   if(err) {
  //       res.send({
  //         code: "500",
  //         message: err,
  //       });
  //   } else {
  //     res.send({
  //       code: "200",
  //       message: "ok",
  //       data:{account:data}
  //     });
  //   }
  // });
  res.send({
    code: "200",
    message: "ok",
    data: {
      account: userId
    }
  });
});

router.get('/getRechargeList', function (req, res, next) {
  console.log(req)
  db.rechargeList(req.body.account, req.body.status, req.body.pageIndex, req.body.pageCount, function (err, list) {
    console.log(err, list, "list");
    if (err) {
      res.send({
        code: "500",
        message: err,
      });
    } else {
      res.send({
        code: "200",
        message: "success",
        data: list
      });
    }
  });
})

router.post('/transfer', function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genTTrackId(userId, req.body.amount, req.body.time);
  //check
  console.log({
    "trackId": trackId,
    "userId": userId,
    "amount": amount
  });
  db.transfer(trackId, userId, amount, 1, function (err, ret) {
    res.send({
      code: "200",
      message: "OK"
    });
  });

  // pgRpc.transfer(trackId, userId, amount, function(err,ret) {
  //});
})

router.get('/txStatus', function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genTTrackId(userId, req.body.amount, req.body.time);
})



router.post('/retry', function (req, res, next) {

  // pgRpc.notiErrorRetry(req.body.day, function (err, ret) {
  //   res.send({
  //     code: "200",
  //     message: "OK"
  //   });
  // });
  console.log({
    "vactHook": {
      "trxDay": req.body.day
    }
  });

  res.send({
    code: "200",
    message: "OK"
  });
})

module.exports = router;