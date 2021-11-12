
const mysql = require('mysql');
const utils = require('../utils');
const log4js = require('../logger');
const logger = log4js.getLogger("info");

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    // password: '123456@',
    password: '12345678',
    database: 'pgnode',
    port: 3306
});

function createTables() {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error("mysql", err);
        } else {
            let creat_recharges = `CREATE TABLE recharges (
                                        trxId varchar(30) PRIMARY KEY NOT NULL,
                                        account varchar(30) NOT NULL,
                                        bankCd varchar(50) NOT NULL,
                                        sender varchar(50) NOT NULL,
                                        amount varchar(100) NOT NULL,
                                        createTime TIMESTAMP NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8`;
            connection.query(creat_recharges, function (err) {
                logger.error("create table error", err);
            });

            let creat_transfers = `CREATE TABLE transfers (
                                        trackId varchar(30) PRIMARY KEY NOT NULL,
                                        userId varchar(66) NOT NULL,
                                        amount varchar(100) NOT NULL,
                                        status INT NOT NULL,
                                        createTime TIMESTAMP NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8`;

            connection.query(creat_transfers, function (err) {
                logger.error("create table error", err);
            });
        }
    });
}


function insert(table, row, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error("mysql", err);
        } else {
            connection.query('INSERT INTO ?? SET ?', [table, row], function (err,ret) {
                connection.release();
                if (err) {
                    logger.error("INSERT", table, err.code);
                    if(err.code == "ER_DUP_ENTRY") {
                        callback(null, {});
                    } else {
                        callback(err, null);
                    }
                } else {
                    logger.info("INSERT", table, row);
                    callback(null, {});
                }
            });
        }
    });
}

function update(talbe, key, value) {
    pool.getConnection(function (err, connection) {
        connection.query('UPDATE ?? SET `col1` = 2', [table], function (error, results) {
            connection.release();
            if (err) {
                logger.error("UPDATE", table, err);
                callback(err, null);
            } else {
                logger.info("UPDATE", table, row);
                callback(null, {});
            }
        });
    });
}

function saveRecharge(rechargeItem, callback) {
    insert("recharges", rechargeItem, callback);
}

function saveTransfer(transferItem, callback) {
    insert("transfers", transferItem, callback);
}

function updateTransferStatus(trackId, status, callback) {
    pool.getConnection(function (err, connection) {
        let sql = "UPDATE ?? SET `status` = ? where trackId=? AND status=0;";
        connection.query(sql, ["transfers", status, trackId], function (error, results) {
            connection.release();
            if (results && results.affectedRows == 1) {
                callback(null, {});
            } else {
                if (!error) {
                    error = results.message
                }
                logger.error("UPDATE", error);
                callback(error, null);
            }
        });
    });
}

function transferStatus(trackId, callback) {
    pool.getConnection(function (err, connection) {
        connection.query("SELECT status from transfers where `trackId`='" + trackId + "';", function (error, results, fields) {
            connection.release();
            logger.info("transferStatus", error, results);
            if (error || results.length == 0) {
                logger.error("transferStatus", trackId, error, results);
                callback("no row", null);
            } else {
                callback(null, results[0].status);
            }
        });
    });
}

function rechargeList(account, pageIndex, pageCount, callback) {
    let sql = "SELECT * from recharges";
    if (account) {
        sql += " where account='" + account + "'";
    }
    if (!pageIndex) {
        pageIndex = 0;
    }
    if (!pageCount) {
        pageCount = 10;
    }
    let offset = pageIndex * pageCount;
    sql += " ORDER BY createTime DESC LIMIT " + offset + "," + pageCount + ";";

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (error, results, fields) {
            connection.release();
            let list = [];
            if(error || results && results.length == 0) {
                callback(null, list);
            } else {
                results.forEach(row => {
                    list.push({
                        "trxId": row.trxId,
                        "account": row.account,
                        "amount": row.amount,
                        "status": row.status,
                        "createTime": row.createTime,
                    });
                });
                callback(err, list);
            }
        });
    });
}


module.exports = {
    createTables,
    rechargeList,
    saveRecharge,
    saveTransfer,
    updateTransferStatus,
    transferStatus,
}