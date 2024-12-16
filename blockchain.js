import crypto from "crypto";

const blockchain = [];
const pendingTransactions = [];

function generateBlockHash(previousHash, transactions, timestamp) {
    const data = `${previousHash}${JSON.stringify(transactions)}${timestamp}`;
    return crypto.createHash("sha256").update(data).digest("hex");
}

function createGenesisBlock() {
    const genesisBlock = {
        index: 1,
        timestamp: Date.now(),
        transactions: [],
        previousHash: "0",
        hash: generateBlockHash("0", [], Date.now()),
    };
    blockchain.push(genesisBlock);
}

function createBlock(previousHash, transactions) {
    const timestamp = Date.now();
    return {
        index: blockchain.length + 1,
        timestamp,
        transactions,
        previousHash,
        hash: generateBlockHash(previousHash, transactions, timestamp),
    };
}

function minePendingTransactions() {
    if (pendingTransactions.length === 0) throw new Error("No transactions to mine");
    const previousHash = blockchain[blockchain.length - 1].hash;
    const block = createBlock(previousHash, pendingTransactions);
    blockchain.push(block);
    pendingTransactions.length = 0;
    return block;
}

function addTransaction(transaction) {
    if (!transaction.sender || !transaction.recipient || transaction.amount <= 0) {
        throw new Error("Invalid transaction");
    }
    pendingTransactions.push(transaction);
}

createGenesisBlock();

export { blockchain, pendingTransactions, createBlock, minePendingTransactions, addTransaction };
