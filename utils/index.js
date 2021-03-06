const bs58 = require('bs58')
const abi = require('web3-eth-abi');
const { toHex, encodePacked, keccak256 } = require('web3-utils');

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

function genUserId(pkr) {
    return "U" + pkr.slice(0, 20) + pkr.slice(64, 73);
}

function genTTrackId(userId, itemId) {
    let hash = keccak256(abi.encodeParameters(["string", "uint"], [userId, itemId]));
    return "T" + Math.floor(Date.now()/1000) + hash.slice(2, 9)
}

function genRTrackId(userId, time) {
    let hash = keccak256(userId);
    return "T" + time + hash.slice(2, 9)
}


module.exports = {
    dateFormat,
    genTTrackId,
    genRTrackId,
    genUserId
}