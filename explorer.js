const { blockchain } = require("./blockchain");

function getBlockByHash(hash) {
    return blockchain.find(block => block.hash === hash);
}

function getAddressData(address) {
    const transactions = blockchain.flatMap(block => block.transactions).filter(tx => tx.sender === address || tx.recipient === address);
    const balance = transactions.reduce((acc, tx) => (tx.recipient === address ? acc + tx.amount : acc - tx.amount), 0);
    return { transactions, balance };
}

module.exports = { getBlockByHash, getAddressData };
