const crypto = require("crypto");

let blockchain = [];
let pendingTransactions = [];

function calculateHash(block) {
    return crypto.createHash("sha256").update(JSON.stringify(block)).digest("hex");
}

function createBlock(previousHash, transactions) {
    const block = {
        index: blockchain.length + 1,
        timestamp: Date.now(),
        transactions,
        previousHash,
    };
    block.hash = calculateHash(block);
    return block;
}

// Initialize Genesis Block
blockchain.push(createBlock("0", []));

module.exports = { blockchain, pendingTransactions, createBlock };