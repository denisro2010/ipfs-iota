const {
    SingleNodeClient
} = require("@iota/iota.js");
const {
    Converter
} = require("@iota/util.js");
const {
    sendData
} = require("@iota/iota.js");
const {
    retrieveData
} = require("@iota/iota.js");
const express = require('express');
const IPFS = require('ipfs-http-client') 
const IOTAclient = new SingleNodeClient("https://chrysalis-nodes.iota.org/");
const app = express();
module.exports = app;

//Initialize server
var listener = app.listen(8089);

//Función Main
async function run() {

	var data = "Epstein didn't kill himself";
	storeData(data);
}

async function storeData(data){

	//Store the data in IPFS and get the resulting CID
	const ipfs = await IPFS.create();
	let { cid } = await ipfs.add(JSON.stringify(data));

	var regExp = /(([^)]+))/;
	var onlyCid = regExp.exec(cid);

    	const myIndex = Converter.utf8ToBytes("Index");
	    
	//Sends the IPFS CID to IOTA    
	const sendResult = await sendData(IOTAclient, myIndex, Converter.utf8ToBytes(onlyCid[1]));
	console.log("IPFS hash: " + onlyCid[1]);
	const msgId = sendResult.messageId; //El ID de la tx de IOTA
	
	//Calls the data retrieval function
	console.log("IOTA ID: " + msgId);
	getData(msgId);
}  

async function getData(msgId){
	
	//Gets the IPFS CID from IOTA
	const message = await IOTAclient.message(msgId);
	const decoded = await retrieveData(IOTAclient, msgId);
	const indexDec = Converter.bytesToUtf8(decoded.index)
	const ipfsHash = Converter.bytesToUtf8(decoded.data)
	
	//Gets the IPFS data
	const http0 = require('http');
	let req0 = http0.get('http://127.0.0.1:8082/ipfs/' + ipfsHash, function(res) {
	let data0 = '',
		json_data0;

	res.on('data', function(stream) {
		data0 += stream;
	});
	res.on('end', function() {
		json_data0 = JSON.parse(data0);
		IPFSRawdata = json_data0;

	console.log("Data from IPFS: " + IPFSRawdata)
	});
	});
}	

run()
    .then(() => console.log(""))
    .catch((err) => console.error(err));
