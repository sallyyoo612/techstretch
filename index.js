const express = require('express');
const parser = require('body-parser');
const path = require('path');
const uuidv4 = require('uuid/v4');
const Blockchain = require('./blockchain.js');

const app = express();

app.use(parser.json());
app.use(parser.urlencoded( {extended: false} )); 

let chain = new Blockchain(); 
let nodeIdentifier = uuidv4();

app.get('/mine',function(req,res) {
	let lastBlock = chain.getLastBlock();
	let lastProof = lastBlock.proof; 
	let proof = chain.proofOfWork(lastProof);

	chain.newTransaction("0", nodeIdentifier, 1);

	let previousHash = chain.hash(lastBlock);
	let block = chain.newBlock(proof, previousHash);

	let response = { 
		message: "New block whoohoo!",
		block: block
	}

	res.send(response);
})

app.post('/transactions/new', function(req,res) {
	let {sender, recipient, ID} = req.body;

	let index = chain.newTransaction(sender, recipient, ID);

	let response = `Transaction will be added to Block ${index} :-)`

	res.send(response);
})

app.get('/chain', function(req,res) {
	res.send(chain);
})

const port = process.env.PORT || 3001; 

app.listen(port,() => { 
		console.log(`App listening on port ${port}`);
})
