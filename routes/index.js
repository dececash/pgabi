var express = require('express');
const pgRpc = require('../pgrpc');
const db = require('../db');
const utils = require('../utils');
var router = express.Router();

const log4js = require('../logger');
const logger = log4js.getLogger("info");

router.post('/notify', function (req, res, next) {
  logger.info("recharge req", JSON.stringify(req.body));
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
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genRTrackId(userId, Math.floor(new Date().getTime() / 1000));
  logger.info("register", req.body.pkr, userId, trackId);

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
      "beneficiary": req.body.name
    }
  }

  pgRpc.register(miniMcht, function (err, data) {
    if (err) {
      logger.error("register error", userId, trackId, err);
      res.send({
        code: "500",
        message: err,
      });
    } else {
      logger.info("register ret", userId, trackId, JSON.stringify(data));
      res.send({
        code: "200",
        message: "OK",
        data: data
      });
    }
  })
});

router.get('/getUserInfo', function (req, res, next) {
  let userId = utils.genUserId(req.query.pkr);
  pgRpc.getUserInfo(userId, function (err, data) {
    if (err) {
      res.send({
        code: "500",
        message: err,
      });
    } else {
      res.send({
        code: "200",
        message: "ok",
        data: data
      });
    }
  });
});

router.get('/getRechargeList', function (req, res, next) {
  db.rechargeList(req.body.account, req.body.status, req.body.pageIndex, req.body.pageCount, function (err, list) {
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
  let amount = req.body.amount;
  logger.info("transfer", userId, trackId, amount, req.body.time);
  pgRpc.transfer(trackId, userId, amount, function (err, ret) {
    if (err) {
      logger.error("transfer error", JSON.stringify(err));
    } else {
      logger.info("transfer ret", JSON.stringify(ret));
    }

    db.saveTransfer(trackId, userId, amount, err ? 2 : 1);

    res.send({
      code: "200",
      message: "OK"
    });
  });
})

router.get('/transferStatus', function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genTTrackId(userId, req.body.amount, req.body.time);
  db.transferStatus(trackId, function (err, ret) {
    let status = 1;
    if (ret) {
      status = ret.status;
    }
    res.send({
      code: "200",
      message: "OK",
      data: { status: 1 }
    });
  })
})



router.post('/retry', function (req, res, next) {
  logger.info("retry", req.body.day);

  pgRpc.notiErrorRetry({
    "vactHook": {
      "trxDay": req.body.day
    }
  }, function (err, ret) {
    res.send({
      code: "200",
      message: "OK"
    });
  });
})

module.exports = router;