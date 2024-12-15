const blockchain = [];
const pendingTransactions = [];

function createBlock(previousHash, transactions) {
    const block = {
        index: blockchain.length + 1,
        timestamp: Date.now(),
        transactions,
        previousHash,
        hash: generateBlockHash(previousHash, transactions),
    };
    return block;
}

function isValidChain(chain) {
    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
        }
    }
    return true;
}

function generateBlockHash(previousHash, transactions) {
    const data = `${previousHash}${JSON.stringify(transactions)}${Date.now()}`;
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
}

// Export all variables and functions as named exports
export { blockchain, pendingTransactions, createBlock, isValidChain };
