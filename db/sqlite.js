const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('pg.db');
const utils = require('../utils');

const log4js = require('../logger');
const logger = log4js.getLogger("info");

function createTables() {
    database.serialize(function () {
        // database.run("DROP TABLE recharge");

        database.run("CREATE TABLE recharges (trxId CHAR(30) PRIMARY KEY NOT NULL," +
            "account CHAR(30) NOT NULL, " +
            "bankCd CHAR(50) NOT NULL, " +
            "sender CHAR(50) NOT NULL, " +
            "amount INT NOT NULL, " +
            "createTime INTEGER NOT NULL);");

        database.run("CREATE TABLE transfers (trackId CHAR(30) PRIMARY KEY NOT NULL," +
            "userId CHAR(66) NOT NULL, " +
            "amount INT NOT NULL, " +
            "status INT NOT NULL, " + //statue 0:未打款，1:已打款，2:已打款失败
            "createTime INTEGER NOT NULL);");
    });
}

function saveRecharge(recharge, callback) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        var stmt = database.prepare("INSERT INTO recharges VALUES (?, ?, ?, ?, ?, ?)"); //root, pkr, 
        stmt.run(recharge.trxId, recharge.account, recharge.bankCd, recharge.sender, recharge.amount, recharge.createTime.getTime());
        stmt.finalize(function (err) {
            if (err) {
                logger.error("saveRecharge", err);
                database.run("ROLLBACK");
                callback(err);
            } else {
                callback(null);
            }
        });
        database.run("COMMIT TRANSACTION");

    });
}

function saveTransfer(txItem, callback) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        var stmt = database.prepare("INSERT INTO transfers VALUES (?, ?, ?, ?, ?)"); //root, pkr, 
        stmt.run(txItem.trackId, txItem.userId, txItem.amount, txItem.status, txItem.createTime.getTime());

        stmt.finalize(function (err) {
            if (err) {
                logger.error("saveTransfer", JSON.stringify(err));
                database.run("ROLLBACK");
            }
        });

        database.run("COMMIT TRANSACTION");
    });
}

function updateTransferStatus(trackId, status, callback) {
    database.serialize(function () {
        database.run("BEGIN TRANSACTION");
        database
        var stmt = database.prepare("UPDATE transfers set status=? where trackId='?';"); //root, pkr, 
        stmt.run(status, trackId);
        stmt.finalize(function (err) {
            if (err) {
                logger.error("updateTransferStatus", JSON.stringify(err));
                database.run("ROLLBACK");
                callback(err)
            } else {
                callback(null);
            }
        });
        database.run("COMMIT TRANSACTION");
    });
}

function transferStatus(trackId, callback) {
    database.get("SELECT status from transfers where trackId='" + trackId + "';", function (err, row) {
        let status = 1;
        if (row) {
            status = row.status;
        }
        callback(null, status);
    });
}

function rechargeList(account, status, pageIndex, pageCount, callback) {
    let sql = "SELECT * from recharges";
    if (account && status) {
        sql += " where account='" + account + "' AND status=" + status;
    } else if (account) {
        sql += " where account='" + account + "'";
    } else if (status) {
        sql += " where status=" + status;
    }
    if (!pageIndex) {
        pageIndex = 0;
    }
    if (!pageCount) {
        pageCount = 10;
    }
    let offset = pageIndex * pageCount;
    sql += " ORDER BY createTime DESC LIMIT " + offset + "," + pageCount + ";";

    database.all(sql, function (err, rows) {
        let list = [];
        if(err || !rows || rows.length == 0) {
            callback(err, list);
            return;
        }
        rows.forEach(row => {
            list.push({
                "trxId": row.trxId,
                "account": row.account,
                "amount": row.amount,
                "status": row.status,
                "createTime": new Date(row.createTime),
            });
        });
        callback(err, list);
    });
}


function runSQL(sql, callback) {
    database.all(sql, function (err, rows) {
        callback(err, rows);
    });
}

module.exports = {
    createTables,
    rechargeList,
    saveRecharge,
    saveTransfer,
    updateTransferStatus,
    transferStatus,
    runSQL,
}