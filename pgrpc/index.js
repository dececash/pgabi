const axios = require('axios');
const log4js = require('../logger');
const logger = log4js.getLogger("info");
const utils = require("../utils");

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
        console.log(response,"send");
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

function register(miniMcht, callback) {
    post("user", {
        "miniMcht": miniMcht
    }, function (err, response) {
        // console.log(err,">>>>")
        // console.log(response,"register");
        if (err) {
            callback(err, null)
        } else {
            callback(null, response.data);
        }
    })
}

function getUserInfo(userId, callback) {
    get("user/" + userId, function (err,response) {
        // console.log(err,"getUserInfo")
        // console.log(response,">>>>>");

        if (err) {
            callback(err, null)
        } else {
            console.log(1);
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
