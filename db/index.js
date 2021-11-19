
const db = require('./mysql');
// const db = require('./sqlite');


function createTables() {
    db.createTables();
}

function saveUser(user, callback) {
    db.saveUser(user, callback);
}

function saveRecharge(rechargeItem, callback) {
    db.saveRecharge(rechargeItem, callback);
}

function saveTransfer(transferItem, callback) {
    db.saveTransfer(transferItem, callback);
}

function updateTransferStatus(itemId, trackId, status, callback) {
    db.updateTransferStatus(itemId, trackId, status, callback);
}

function getTransfer(itemId, callback){
    db.getTransfer(itemId, callback);
}

// function transferStatus(trackId, callback) {
//     db.transferStatus(trackId, callback);
// }

function rechargeList(account, pageIndex, pageCount, callback) {
    db.rechargeList(account, pageIndex, pageCount, callback);
}

function getUserInfo(useId, callback) {
    db.getUserInfo(useId, callback);
}


module.exports = {
    createTables,
    rechargeList,
    saveUser,
    saveRecharge,
    saveTransfer,
    updateTransferStatus,
    // transferStatus,
    getUserInfo,
    getTransfer
}