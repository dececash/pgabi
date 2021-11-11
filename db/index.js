
// const db = require('./mysql');
const db = require('./sqlite');


function createTables() {
    db.createTables();
}

function saveRecharge(rechargeItem, callback) {
    db.saveRecharge(rechargeItem, callback);
}

function saveTransfer(transferItem, callback) {
    db.saveTransfer(transferItem, callback);
}

function updateTransferStatus(trackId, status) {
    db.updateTransferStatus(trackId, status);
}

function transferStatus(trackId, callback) {
    db.transferStatus(trackId, callback);
}

function rechargeList(account, status, pageIndex, pageCount, callback) {
    db.rechargeList(account, status, pageIndex, pageCount, callback);
}


module.exports = {
    createTables,
    saveRecharge,
    saveTransfer,
    updateTransferStatus,
    transferStatus,
    rechargeList,
}