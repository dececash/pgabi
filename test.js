const pgRpc = require('./pgrpc');

const rpl = require('rlp');
const abi = require('web3-eth-abi');

const { toHex, soliditySha3, soliditySha3Raw, encodePacked, keccak256 } = require('web3-utils');
const utils = require('./utils');

// pgRpc.getUserInfo("decetest00001", function(err, ret) {
//     console.log(err, ret);
// })


//


let datas = keccak256(abi.encodeParameters(["string", "string", "uint"], ["1", "SERO", "100"]));
// console.log(datas);
// console.log(keccak256(encodePacked("1","SERO","100")));
// console.log(soliditySha3("1","SERO","100"));
console.log(utils.genTrackId("test001", "SERO", 100, parseInt(new Date().getTime() / 1000)));