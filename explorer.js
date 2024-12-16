// Import or link to your blockchain data structure
const blockchain = []; // Ensure this is replaced or linked to your actual blockchain data

/**
 * Get block details by its hash.
 * @param {string} hash - The hash of the block to search for.
 * @returns {object|null} - The block if found, otherwise null.
 */
export function getBlockByHash(hash) {
    console.log("Searching for block with hash:", hash); // Log the hash being searched

    if (!hash) {
        console.error("Invalid block hash provided.");
        return null;
    }

    // Search for the block in the blockchain
    const block = blockchain.find((block) => block.hash === hash);
    if (!block) {
        console.error(`Block not found for hash: ${hash}`);
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
    console.log("Fetching data for address:", address); // Log the address being searched

    if (!address) {
        console.error("Invalid address provided.");
        return null;
    }

    let balance = 0;
    const transactions = [];

    console.log("Iterating through blockchain to calculate balance and transactions...");
    // Iterate through all blocks and transactions in the blockchain
    blockchain.forEach((block, blockIndex) => {
        console.log(`Checking block ${blockIndex + 1}:`, block);

        block.transactions.forEach((transaction, transactionIndex) => {
            console.log(
                `Checking transaction ${transactionIndex + 1} in block ${block.index}:`,
                transaction
            );

            if (transaction.sender === address) {
                balance -= transaction.amount;
                transactions.push({
                    type: "sent",
                    amount: transaction.amount,
                    recipient: transaction.recipient,
                    timestamp: block.timestamp,
                });

                console.log(
                    `Sender match found in block ${block.index}, transaction ${transactionIndex + 1}:`,
                    transaction
                );
            } else if (transaction.recipient === address) {
                balance += transaction.amount;
                transactions.push({
                    type: "received",
                    amount: transaction.amount,
                    sender: transaction.sender,
                    timestamp: block.timestamp,
                });

                console.log(
                    `Recipient match found in block ${block.index}, transaction ${transactionIndex + 1}:`,
                    transaction
                );
            }
        });
    });

    console.log(`Address data fetched for: ${address}`, { balance, transactions });
    return { balance, transactions };
}
