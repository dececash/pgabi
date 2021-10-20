const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('sero.db');
const utils = require('../utils');

const log4js = require('../logger');
const logger = log4js.getLogger("info");

function createTables() {
    database.serialize(function () {
        // database.run("DROP TABLE recharge");

        database.run("CREATE TABLE users (userId CHAR(30) PRIMARY KEY NOT NULL," +
            "account CHAR(30) NOT NULL, " +
            "createTime CHAR(10) NOT NULL);");
        database.run("CREATE TABLE recharges (trxId CHAR(30) PRIMARY KEY NOT NULL," +
            "account CHAR(30) NOT NULL, " +
            "amount INT NOT NULL, " +
            "status INT NOT NULL, " +
            "createTime CHAR(10) NOT NULL);");

        database.run("CREATE TABLE transfers (trackId CHAR(30) PRIMARY KEY NOT NULL," +
            "userId CHAR(66) NOT NULL" +
            "account CHAR(30) NOT NULL, " +
            "amount INT NOT NULL, " +
            "status INT NOT NULL, " +
            "createTime CHAR(10) NOT NULL);");
    });
}

function saveRecharge(recharge) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        var stmt = database.prepare("INSERT INTO recharges VALUES (?, ?, ?, ?, ?,?, ?)"); //root, pkr, 
        stmt.run(recharge.trxId, recharge.bankCd, recharge.account, recharge.sender, recharge.amount, 0, recharge.createTime);

        stmt.finalize(function (err) {
            if (err) {
                logger.error(err);
                database.run("ROLLBACK");
            }
        });

        database.run("COMMIT TRANSACTION");
    });
}

function auditingRecharge(trxIds, status) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        var stmt = database.prepare("UPDATE recharges set status=? where trxId=?;"); //root, pkr, 
        trxIds.forEach(trxId => {
            stmt.run(status, trxId);
        });

        stmt.finalize(function (err) {
            if (err) {
                logger.error(err);
                database.run("ROLLBACK");
            }
        });

        database.run("COMMIT TRANSACTION");
    });
}

function rechargeList(account, OFFSET, callback) {
    database.all("SELECT * from recharges where account=" + account + " LIMIT 10 OFFSET " + OFFSET, function (err, rows) {
        let list = [];

        rows.forEach(row => {
            list.push({
                "trxId": row.trxId,
                "bankCd": row.bankCd,
                "account": row.account,
                "sender": row.sender,
                "amount": row.amount,
                "createTime": row.createTime,
            });
        });
        callback(err, list);
    });
}

function transfer(trackId, userId, amount, callback) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        var stmt = database.prepare("INSERT INTO transfers VALUES (?, ?, ?, ?, ?, ?)"); //root, pkr, 
        var createTime = utils.dateFormat("YYYY-mm-dd HH:MM:SS")
        stmt.run(trackId, userId, amount, amount, "DONE", createTime);

        stmt.finalize(function (err) {
            if (err) {
                logger.error(err);
                database.run("ROLLBACK");
            }
        });

        database.run("COMMIT TRANSACTION");
    });
}

function runSQL(sql, callback) {
    database.all(sql, function (err, rows) {
        callback(err, rows);
    });
}

module.exports = {
    createTables,

}