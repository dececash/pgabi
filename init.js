const pgRpc = require('./pgrpc');

const rpl = require('rlp');
const abi = require('web3-eth-abi');
const db = require('./db');
const { encrypt } = require('./encrypt');

const { toHex, soliditySha3, soliditySha3Raw, encodePacked, keccak256 } = require('web3-utils');
const utils = require('./utils');

// pgRpc.getUserInfo("decetest00001", function(err, ret) {
//     console.log(1);
// })


// db.createTables();
// db.runSQL("SELECT * from transfers", function(err, rows) {
//     rows.forEach(element => {
//         console.log(element);
//     });
// })


var key = Buffer.alloc(32);
key.write("123456");

const plaintext = Buffer.from("pk_401c-226ab8-d1a-27f4f");
const data = encrypt(plaintext, key);
console.log(data.toString('hex'));
console.log(encrypt(Buffer.from('a787016fbd3836351b88a4e658962c10d99e0d1552cebfaa', 'hex'), key).toString());

// let datas = keccak256(abi.encodeParameters(["string", "string", "uint"], ["1", "SERO", "100"]));
// console.log(datas);
// console.log(keccak256(encodePacked("1","SERO","100")));
// console.log(soliditySha3("1","SERO","100"));
// console.log(utils.genTrackId("test001", "SERO", 100, parseInt(new Date().getTime() / 1000)));