import crypto from "crypto";

// Initialize the blockchain array
const blockchain = [];

// Initialize the pending transactions
const pendingTransactions = [];

// Function to generate a block hash
function generateBlockHash(previousHash, transactions, timestamp) {
    const data = `${previousHash}${JSON.stringify(transactions)}${timestamp}`;
    return crypto.createHash("sha256").update(data).digest("hex");
}

// Function to create the genesis block
function createGenesisBlock() {
    const genesisBlock = {
        index: 1,
        timestamp: Date.now(),
        transactions: [],
        previousHash: "0",
        hash: generateBlockHash("0", [], Date.now()),
        merkleRoot: "0", // No transactions in the genesis block
    };
    blockchain.push(genesisBlock);
}

// Function to create a new block
function createBlock(previousHash, transactions) {
    const timestamp = Date.now();
    const merkleRoot = generateMerkleRoot(transactions); // Compute Merkle Root
    return {
        index: blockchain.length + 1,
        timestamp,
        transactions,
        merkleRoot, // Add Merkle Root
        previousHash,
        hash: generateBlockHash(previousHash, transactions, timestamp),
    };
}

// Function to add a transaction to the pool
function addTransaction(transaction) {
    if (!transaction.sender || !transaction.recipient || transaction.amount <= 0) {
        throw new Error("Invalid transaction data");
    }
    pendingTransactions.push(transaction); // Add to pending transactions
}

function minePendingTransactions() {
    if (pendingTransactions.length === 0) {
        throw new Error("No transactions to mine");
    }

    // Copy pending transactions before clearing them
    const transactionsToInclude = [...pendingTransactions];

    const previousHash = blockchain[blockchain.length - 1].hash;
    const block = createBlock(previousHash, transactionsToInclude);

    blockchain.push(block);

    // Clear the pending transactions after they are included in the block
    pendingTransactions.length = 0;

    return block;
}

// Function to generate a Merkle Root for transactions
function generateMerkleRoot(transactions) {
    if (transactions.length === 0) return "0"; // Return "0" for empty transactions
    let hashes = transactions.map(tx =>
        crypto.createHash("sha256").update(JSON.stringify(tx)).digest("hex")
    );
    while (hashes.length > 1) {
        const temp = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const hash1 = hashes[i];
            const hash2 = hashes[i + 1] || hash1; // Duplicate the last hash if odd number of hashes
            temp.push(crypto.createHash("sha256").update(hash1 + hash2).digest("hex"));
        }
        hashes = temp;
    }
    return hashes[0];
}

// Create the Genesis Block on initialization
createGenesisBlock();

// Export the variables and functions
export {
    blockchain,             // The blockchain array
    pendingTransactions,    // Pending transactions array
    createBlock,            // Function to create a new block
    minePendingTransactions, // Function to mine pending transactions
    generateMerkleRoot,     // Function to generate Merkle Root
    addTransaction,         // Function to add transactions
};
