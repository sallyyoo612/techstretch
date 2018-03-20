const hash = require('hash.js');
const axios = require('axios'); 

let sha256 = hash.sha256; 

class Blockchain {
	constructor() {
		this.chain = [];
		this.currentTransactions = [];

		this.nodes = new Set();

		this.newBlock(100,1);
	}

	newBlock(proof,previousHash) {

		let block = {
			index: this.chain.length + 1, 
			timestamp: Date.now(),
			transactions: this.currentTransactions, 
			proof: proof,
			previousHash: previousHash, 
		}

		this.currentTransactions = [];
		this.chain.push(block);

		return block;
	}

	newTransaction(sender,recipient,serial,photoUrl,manufacturer,type) {
		let transaction = { 
			sender: sender,
			recipient: recipient, 
			object: {
				serial: serial,
				photoUrl: photoUrl, 
				manufacturer: manufacturer,
				type: type
			}
		}
		this.currentTransactions.push(transaction);

		return this.getLastBlock().index + 1
	}

	hash(block) { 
		let blockStr = JSON.stringify(block);
		return sha256().update(blockStr).digest('hex')
	}

	getLastBlock() { 
		return this.chain[this.chain.length - 1];
	}

	proofOfWork(lastProof) {
		let proof = 0

		while(!this.validProof(lastProof, proof)) {
			proof++;
		}

		return proof
	}

	validProof(lastProof, proof) {
		let guess = `${lastProof}${proof}`;
		let guessHash = sha256().update(guess).digest('hex');
		return guessHash.substring(0,3) === '000';
	}

	registerNode(address) {
		this.nodes.add(address);
		console.log(this.nodes);
	}

	validChain(chain) { 
		let lastBlock = this.chain[0];
		let idx = 1; 

		while (idx < chain.length) { 
			let block = chain[idx];
			
			if (block.previousHash !== this.hash(lastBlock)) { 
				return false;
			}

			if (!this.validProof(lastBlock.proof, block.proof)) {
				return false; 
			}

			lastBlock = block;
			idx++;
		}
		return true;
	}

	resolveConflicts() {
		let newChain; 
		let maxLength = this.chain.length; 

		async function testNodes() { 
			for (let node of this.nodes) {
				console.log('node: ', node, `${node}/chain`);
				let response = await axios.get(`${node}/chain`);

				let chain = response.chain;

				if(chain.length > maxLength && this.validChain(chain)) {
					maxLength = chain.length;
					newChain = chain; 
				}
			}
			if (newChain) { 
				this.chain = newChain;
				return true;
			}

			return false;
		}

		return testNodes();

	}

}

module.exports = Blockchain;		