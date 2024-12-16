import crypto from "crypto";

// Helper function to get current timestamp for consistency
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Initialize blockchain with a genesis block
const blockchain = [
    {
        index: 1,
        timestamp: getCurrentTimestamp(),
        transactions: [],
        previousHash: "0",
        hash: generateBlockHash("0", [], getCurrentTimestamp()),
    },
];
console.log("Genesis block initialized:", blockchain[0]);

// Pending transactions to be included in the next block
const pendingTransactions = [];

/**
 * Generate a hash for a block based on its data.
 * @param {string} previousHash - The hash of the previous block.
 * @param {Array} transactions - The list of transactions in the block.
 * @param {string} timestamp - The timestamp of the block.
 * @returns {string} - The generated hash.
 */
function generateBlockHash(previousHash, transactions, timestamp) {
    try {
        const data = `${previousHash}${JSON.stringify(transactions)}${timestamp}`;
        const hash = crypto.createHash("sha256").update(data).digest("hex");
        console.log("Generated hash:", hash, "from data:", { previousHash, transactions, timestamp });
        return hash;
    } catch (error) {
        console.error("Error generating block hash:", error.message);
        throw error;
    }
}

/**
 * Create a new block for the blockchain.
 * @param {string} previousHash - The hash of the previous block.
 * @param {Array} transactions - The transactions to include in the block.
 * @returns {object} - The newly created block.
 */
function createBlock(previousHash, transactions) {
    try {
        const timestamp = getCurrentTimestamp();
        const block = {
            index: blockchain.length + 1,
            timestamp,
            transactions,
            previousHash,
            hash: generateBlockHash(previousHash, transactions, timestamp),
        };
        console.log("Created block:", block);
        return block;
    } catch (error) {
        console.error("Error creating block:", error.message);
        throw error;
    }
}

/**
 * Validate the integrity of the blockchain.
 * @param {Array} chain - The blockchain to validate.
 * @returns {boolean} - Whether the blockchain is valid.
 */
function isValidChain(chain) {
    console.log("Starting blockchain validation...");

    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        console.log(`Validating block ${currentBlock.index}...`);

        // Check if `previousHash` matches the hash of the previous block
        if (currentBlock.previousHash !== previousBlock.hash) {
            console.error(
                `Validation failed at block ${currentBlock.index}: ` +
                `previousHash (${currentBlock.previousHash}) does not match ` +
                `hash of previous block (${previousBlock.hash}).`
            );
            return false;
        }

        // Check if the block's hash is correct
        const recalculatedHash = generateBlockHash(
            currentBlock.previousHash,
            currentBlock.transactions,
            currentBlock.timestamp
        );
        if (currentBlock.hash !== recalculatedHash) {
            console.error(
                `Validation failed at block ${currentBlock.index}: ` +
                `calculated hash (${recalculatedHash}) does not match stored hash (${currentBlock.hash}).`
            );
            return false;
        }

        console.log(`Block ${currentBlock.index} is valid.`);
    }

    console.log("Blockchain validation passed.");
    return true;
}

/**
 * Debugging utility to print the entire blockchain.
 */
function printBlockchain() {
    console.log("Current Blockchain:");
    blockchain.forEach((block) => {
        console.log(`Block ${block.index}:`, block);
    });
}

export { blockchain, pendingTransactions, createBlock, isValidChain, printBlockchain };
