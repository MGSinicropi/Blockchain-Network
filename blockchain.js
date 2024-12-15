const crypto = require("crypto");

let blockchain = [];
let pendingTransactions = [];

function calculateHash(block) {
    return crypto.createHash("sha256").update(JSON.stringify(block)).digest("hex");
}

function createBlock(previousHash, transactions) {
    let nonce = 0;
    let hash;
    const difficulty = 4; // Adjust for mining complexity
    const block = {
        index: blockchain.length + 1,
        timestamp: Date.now(),
        transactions,
        previousHash,
        nonce,
    };

    do {
        block.nonce = nonce++;
        hash = calculateHash(block);
    } while (!hash.startsWith("0".repeat(difficulty)));

    block.hash = hash;
    return block;
}

// Genesis Block
const genesisBlock = createBlock("0", []);
blockchain.push(genesisBlock);

console.log("Blockchain initialized:", blockchain);

// Validation functions
function isValidBlock(block, previousBlock) {
    if (block.index !== previousBlock.index + 1) return false;
    if (block.previousHash !== previousBlock.hash) return false;
    if (block.hash !== calculateHash(block)) return false;
    return true;
}

function isValidChain(chain) {
    for (let i = 1; i < chain.length; i++) {
        if (!isValidBlock(chain[i], chain[i - 1])) return false;
    }
    return true;
}

module.exports = { blockchain, pendingTransactions, createBlock, isValidBlock, isValidChain };
