const axios = require('axios');
const log4js = require('../logger');
const logger = log4js.getLogger("info");

let rpcId = 0;

function post(path, data, callback) {
    let rpc = "https://wapi.pay-sharp.com/wapi/mini/" + path;
    if (this.rpc) {
        rpc = this.rpc
    }
    axios.post(rpc, data, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'pk_401c-226ab8-d1a-27f4f'
        }
    }).then(function (response) {
        if (callback) {
            if (response.status == 200) {
                callback(null, response);
            } else {
                callback(new Error(response.statusText), null);
            }
        }
    }).catch(function (error) {
        callback(error, null);
    })
}

function get(path, callback) {
    let rpc = "https://wapi.pay-sharp.com/wapi/mini/" + path;
    axios.get(rpc, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'pk_401c-226ab8-d1a-27f4f'
        }
    }).then(function (response) {
        if (callback) {
            if (response.status == 200) {
                callback(null, response);
            } else {
                callback(new Error(response.statusText), null);
            }

        }
    }).catch(function (error) {
        if (callback) {
            callback(error, null);
        }
    })
}

function register(name, identity, phone, accnt, callback) {
    let trackId = "";
    let userId = "";
    post("user", {
        "miniMcht": {
            "trackId": trackId,
            "userId": userId,
            "name": name,
            "taxType": "개인",
            "identity": identity,
            "phone": phone,
            "accnt": accnt
        }
    }, function (err, response) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, response.data.miniMcht);
        }

    })
}

function getUserInfo(userId, callback) {
    get("user/" + userId, function (response) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, response.data.miniMcht);
        }
    });
}

function notiErrorRetry(day, callback) {
    post("notiErrorRetry", {
        "vactHook": {
            "trxDay": day
        }
    }, callback)
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
