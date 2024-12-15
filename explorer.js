const blockchain = []; // Replace with your actual blockchain data structure

/**
 * Get block details by its hash.
 * @param {string} hash - The hash of the block to search for.
 * @returns {object|null} - The block if found, otherwise null.
 */
export function getBlockByHash(hash) {
    if (!hash) {
        console.error("Invalid block hash provided.");
        return null;
    }

    // Search for the block in the blockchain
    const block = blockchain.find((block) => block.hash === hash);
    if (!block) {
        console.log(`Block not found for hash: ${hash}`);
        return null;
    }

    console.log(`Block found for hash: ${hash}`, block);
    return block;
}

/**
 * Get data associated with a specific wallet address.
 * @param {string} address - The address to fetch data for.
 * @returns {object} - The address data, including balance and transactions.
 */
export function getAddressData(address) {
    if (!address) {
        console.error("Invalid address provided.");
        return null;
    }

    let balance = 0;
    const transactions = [];

    // Iterate through all blocks and transactions in the blockchain
    blockchain.forEach((block) => {
        block.transactions.forEach((transaction) => {
            if (transaction.sender === address) {
                balance -= transaction.amount;
                transactions.push({
                    type: "sent",
                    amount: transaction.amount,
                    recipient: transaction.recipient,
                    timestamp: block.timestamp,
                });
            } else if (transaction.recipient === address) {
                balance += transaction.amount;
                transactions.push({
                    type: "received",
                    amount: transaction.amount,
                    sender: transaction.sender,
                    timestamp: block.timestamp,
                });
            }
        });
    });

    console.log(`Address data fetched for: ${address}`, { balance, transactions });
    return { balance, transactions };
}
