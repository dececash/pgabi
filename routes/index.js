var express = require("express");
const pgRpc = require("../pgrpc");
const db = require("../db/index");
const utils = require("../utils");
var router = express.Router();

const log4js = require("../logger");
const logger = log4js.getLogger("info");

const date = require('date-and-time');

router.post("/notify", function (req, res, next) {
  logger.info("recharge info", JSON.stringify(req.body));

  if (req.headers.authorization != global.Authorization) {
    res.status(401).send({
      code: "401",
      message: "Unauthorized"
    });
    return;
  }

  let data = req.body;
  let recharegItem = {
    trxId: data.trxId,
    bankCd: data.bankCd,
    account: data.account,
    sender: data.sender,
    amount: data.amount,
    createTime: date.parse(data.trxDay + data.trxTime, "YYYYMMDDHHmmss")
  };

  db.saveRecharge(recharegItem, function (err) {
    if (err) {
      res.status(500).send({
        code: "500",
        message: err,
      });
    } else {
      res.send({
        code: "200",
        message: "ok",
      });
    }
  });
});

router.post("/register", function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genRTrackId(
    userId, Math.floor(new Date().getTime() / 1000)
  );

  logger.info("register", req.body.pkr, userId, trackId);

  let miniMcht = {
    trackId: trackId,
    userId: userId,
    name: req.body.name,
    taxType: req.body.taxType,
    identity: req.body.identity,
    phone: req.body.phone,
    accnt: {
      account: req.body.account,
      bankCd: req.body.bankCd,
      beneficiary: req.body.name,
    },
  };

  pgRpc.register(miniMcht, function (err, data) {
    if (err) {
      logger.error("register error", userId, trackId, err);
      res.send({
        code: "500",
        message: err,
      });
    } else {
      let info = JSON.stringify(data);
      logger.info("register ret", userId, trackId, JSON.stringify(data));
      db.saveUser({ userId: userId, account: userId, info: info, createTime: new Date() }, function () {
      });
      res.send({
        code: "200",
        message: "OK",
        data: data,
      });
    }
  });
});

router.get("/getUserInfo", function (req, res, next) {
  let userId = utils.genUserId(req.query.pkr);
  pgRpc.getUserInfo(userId, function (err, ret) {
    if (err) {
      res.send({
        code: "500",
        message: err,
      });
    } else {
      res.send({
        code: "200",
        message: "OK",
        data: ret,
      });
    }
  });
  // db.getUserInfo(userId, function (err, ret) {
  //   if (err) {
  //     res.send({
  //       code: "500",
  //       message: err,
  //     });
  //   } else {
  //     res.send({
  //       code: "200",
  //       message: "OK",
  //       data: ret,
  //     });
  //   }
  // });
});

router.post("/saveTransfer", function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genTTrackId(userId, req.body.itemId, req.body.amount, req.body.time);

  let status = 0;
  if (req.body.status) {
    status = req.body.status;
  }
  logger.info("saveTransfer", req.body);
  let transferItem = {
    trackId: trackId,
    userId: userId,
    amount: req.body.amount,
    status: status,
    createTime: new Date(req.body.time * 1000),
  };

  logger.info("saveTransfer", transferItem);
  db.saveTransfer(transferItem, function (err) {
    if (err) {
      res.send({
        code: "500",
        message: err,
      });
    } else {
      res.send({
        code: "200",
        message: "OK",
      });
    }
  });
});

router.post("/transfer", function (req, res, next) {
  let userId = utils.genUserId(req.body.pkr);
  let trackId = utils.genTTrackId(userId, req.body.itemId, req.body.amount, req.body.time);

  logger.info("transfer", trackId, userId, req.body.amount);

  db.transferStatus(trackId, function (err, status) {
    if (err) {
      res.send({
        code: "500",
        message: err,
      });
      return;
    } else {
      if (status == 1) {
        logger.info("transfer", trackId, "has transfered");
        res.send({
          code: "200",
          message: "OK",
        });
        return;
      } else {
        db.updateTransferStatus(trackId, 1, function (err, ret) {
          if (err) {
            logger.error("transfer", trackId, JSON.stringify(err));
            res.send({
              code: "500",
              message: err,
            });
          } else {
            pgRpc.transfer(trackId, userId, req.body.amount, function (err, ret) {
              if (err) {
                logger.error("transfer", trackId, JSON.stringify(err));
              } else {
                logger.info("transfer", trackId, JSON.stringify(ret));
              }
              res.send({
                code: "200",
                message: "OK",
              });
            });
          }
        });
      }
    }
  });
});

router.get("/transferStatus", function (req, res, next) {
  let userId = utils.genUserId(req.query.pkr);
  let trackId = utils.genTTrackId(userId, req.query.itemId, req.query.amount, req.query.time);
  logger.info(trackId, userId, req.query);
  db.transferStatus(trackId, function (err, status) {
    if (status == null) {
      status = 1;
    }
    res.send({
      code: "200",
      message: "OK",
      data: { status: status },
    });
  });
});

router.get("/getRechargeList", function (req, res, next) {
  db.rechargeList(
    req.query.account,
    req.query.pageIndex,
    req.query.pageCount,
    function (err, list) {
      if (err) {
        res.send({
          code: "500",
          message: err,
        });
      } else {
        res.send({
          code: "200",
          message: "success",
          data: list,
        });
      }
    }
  );
});

router.get("/retry", function (req, res, next) {
  logger.info("retry", req.query.day);

  pgRpc.notiErrorRetry(req.query.day, function (err, ret) {

    res.send({
      code: "200",
      message: "OK",
    });
  });
});

module.exports = router;
