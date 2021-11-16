const axios = require('axios');
const log4js = require('../logger');
const logger = log4js.getLogger("info");

function post(path, data, callback) {
    let rpc = "https://wapi.pay-sharp.com/wapi/mini/" + path;
    if (this.rpc) {
        rpc = this.rpc
    }
    axios.post(rpc, data, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': global.Authorization
        }
    }).then(function (response) {
        logger.info("post", path, data, response.data);
        if (callback) {
            if (response.status == 200) {
                callback(null, response.data);
            } else {
                callback(new Error(response.statusText), null);
            }
        }
    }).catch(function (error) {
        logger.error("RPC", error);
        callback(error, null);
    })
}

function get(path, callback) {
    let rpc = "https://wapi.pay-sharp.com/wapi/mini/" + path;
    axios.get(rpc, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': global.Authorization
        }
    }).then(function (response) {
        logger.info("get", path, response.data);
        if (callback) {
            if (response.status == 200) {
                callback(null, response.data);
            } else {
                callback(new Error(response.statusText), null);
            }

        }
    }).catch(function (error) {
        logger.error("RPC", error);
        if (callback) {
            callback(error, null);
        }
    })
}

function register(miniMcht, callback) {
    post("user", {
        "miniMcht": miniMcht
    }, function (err, data) {
        if (err) {
            callback(err, null)
        } else {
            if (data.result.resultCd == "0000") {
                callback(null, data.result.miniMcht);
            } else {
                callback(data.result, null);
            }
        }
    })
}

function getUserInfo(userId, callback) {
    get("user/" + userId, function (err, data) {
        if (err) {
            callback(err, null)
        } else {
            if (data.miniMcht) {
                callback(null, data.miniMcht);
            } else {
                callback(null, data.result);
            }
        }
    });
}

function notiErrorRetry(day, callback) {
    post("notiErrorRetry", {
        "vactHook": {
            "trxDay": day
        }
    }, function (data) {
        callback(data.result);
    })
}

function transfer(trackId, userId, amount, callback) {
    post("transfer/user", {
        "miniBankTransfer": {
            "trackId": trackId,
            "userId": userId,
            "amount": amount
        }
    }, function (err, response) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, response.data.miniMcht);
        }
    });
}

module.exports = {
    register,
    getUserInfo,
    transfer,
    notiErrorRetry,
};
