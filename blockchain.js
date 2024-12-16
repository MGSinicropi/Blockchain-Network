import crypto from "crypto";

const blockchain = [
  {
    index: 1,
    timestamp: Date.now(),
    transactions: [],
    previousHash: "0",
    hash: generateBlockHash("0", [], Date.now()),
  },
];

const pendingTransactions = [];

function generateBlockHash(previousHash, transactions, timestamp) {
  const data = `${previousHash}${JSON.stringify(transactions)}${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function createBlock(previousHash, transactions) {
  const timestamp = Date.now();
  const block = {
    index: blockchain.length + 1,
    timestamp,
    transactions,
    previousHash,
    hash: generateBlockHash(previousHash, transactions, timestamp),
  };
  return block;
}

function isValidChain(chain) {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];
    if (
      currentBlock.previousHash !== previousBlock.hash ||
      currentBlock.hash !==
        generateBlockHash(
          currentBlock.previousHash,
          currentBlock.transactions,
          currentBlock.timestamp
        )
    ) {
      return false;
    }
  }
  return true;
}

export { blockchain, pendingTransactions, createBlock, isValidChain };
