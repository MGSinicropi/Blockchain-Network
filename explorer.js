const blockchain = []; // Replace with your actual blockchain data structure

/**
 * Get block details by its hash.
 * @param {string} hash - The hash of the block to search for.
 * @returns {object|null} - The block if found, otherwise null.
 */
export function getBlockByHash(hash) {
    console.log("Searching for block with hash:", hash);

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
    console.log("Fetching data for address:", address);

    // Normalize the queried address
    const normalizedAddress = address.trim();

    let balance = 0;
    const transactions = [];

    // Iterate through all blocks and transactions in the blockchain
    blockchain.forEach((block) => {
        block.transactions.forEach((transaction) => {
            const normalizedSender = transaction.sender.trim();
            const normalizedRecipient = transaction.recipient.trim();

            if (normalizedSender === normalizedAddress) {
                balance -= transaction.amount;
                transactions.push({
                    type: "sent",
                    amount: transaction.amount,
                    recipient: normalizedRecipient,
                    timestamp: block.timestamp,
                });
            } else if (normalizedRecipient === normalizedAddress) {
                balance += transaction.amount;
                transactions.push({
                    type: "received",
                    amount: transaction.amount,
                    sender: normalizedSender,
                    timestamp: block.timestamp,
                });
            }
        });
    });

    console.log(`Address data for ${normalizedAddress}:`, { balance, transactions });
    return { balance, transactions };
}



