import { blockchain } from "./blockchain.js";

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

    const block = blockchain.find((block) => block.hash === hash);
    if (!block) {
        console.log(`Block not found for hash: ${hash}`);
        return null;
    }

    console.log(`Block found for hash: ${hash}`, block);
    return block;
}

/**
 * Get address data, including balance and transactions.
 * @param {string} address - The address to fetch data for.
 * @returns {object} - The balance and list of transactions for the address.
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

    if (transactions.length === 0) {
        console.log(`No transactions found for address: ${address}`);
    } else {
        console.log(`Address data for ${address}:`, { balance, transactions });
    }

    return { balance, transactions };
}
