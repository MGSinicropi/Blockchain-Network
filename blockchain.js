const crypto = require("crypto");

let blockchain = [];
let pendingTransactions = [];
let nodes = new Set();

// Utility Functions
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

// Miner Implementation
function mine() {
    const previousBlock = blockchain[blockchain.length - 1];
    const block = createBlock(previousBlock.hash, pendingTransactions);
    blockchain.push(block);
    pendingTransactions = [];
    console.log("New block mined:", block);
}

// Export for use in other modules
module.exports = {
    blockchain,
    pendingTransactions,
    nodes,
    calculateHash,
    createBlock,
    mine,
};
