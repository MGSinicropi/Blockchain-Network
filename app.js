import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { blockchain, pendingTransactions, createBlock, isValidChain } from "./blockchain.js";
import { Wallet } from "./wallet.js";
import { getBlockByHash, getAddressData } from "./explorer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const nodes = new Set();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// REST API
app.post("/transaction", (req, res) => {
    const { sender, recipient, amount } = req.body;

    if (!sender || !recipient || typeof amount !== "number" || amount <= 0) {
        console.error("Invalid transaction data:", req.body);
        return res.status(400).json({
            message: "Invalid transaction data. Ensure sender, recipient, and positive amount are provided.",
        });
    }

    const transaction = { sender, recipient, amount };
    pendingTransactions.push(transaction);
    console.log("Transaction added:", transaction);
    res.json({ message: "Transaction added!", transaction });
});

app.get("/mine", (req, res) => {
    try {
        if (pendingTransactions.length === 0) {
            console.log("No transactions available to mine.");
            return res.status(202).json({ message: "No transactions to mine" });
        }

        const previousBlock = blockchain[blockchain.length - 1];
        console.log("Previous block details:", previousBlock);

        const newBlock = createBlock(previousBlock.hash, pendingTransactions);

        console.log("New block created:", newBlock);

        // Validate the block before adding it to the blockchain
        if (newBlock.previousHash !== previousBlock.hash) {
            console.error(
                `Invalid block: previousHash (${newBlock.previousHash}) does not match hash of previous block (${previousBlock.hash}).`
            );
            return res.status(500).json({ message: "Mining failed: invalid block" });
        }

        blockchain.push(newBlock);
        pendingTransactions.length = 0; // Clear transactions

        console.log("Block successfully mined and added to the blockchain:", newBlock);
        return res.json({ message: "Block mined successfully!", block: newBlock });
    } catch (error) {
        console.error("Error during mining:", error.message);
        res.status(500).json({ message: "Internal server error during mining" });
    }
});

app.get("/chain", (req, res) => {
    if (!isValidChain(blockchain)) {
        console.error("Blockchain validation failed. Printing blockchain details:");
        console.error(JSON.stringify(blockchain, null, 2));
        return res.status(500).json({ message: "Blockchain is invalid due to mismatched hashes or tampered data." });
    }

    res.json({ message: "Blockchain fetched successfully!", blockchain });
});

app.post("/faucet", (req, res) => {
    const { recipient, amount } = req.body;

    if (!recipient || typeof amount !== "number" || amount <= 0) {
        console.error("Invalid faucet transaction data:", req.body);
        return res.status(400).json({
            message: "Invalid faucet transaction data. Ensure recipient and positive amount are provided.",
        });
    }

    const transaction = { sender: "faucet", recipient, amount };
    pendingTransactions.push(transaction);
    console.log("Faucet transaction added:", transaction);
    res.json({ message: "Faucet transaction added!", transaction });
});

app.get("/block/:hash", (req, res) => {
    const hash = req.params.hash;

    if (!hash) {
        console.error("Block hash not provided.");
        return res.status(400).json({ message: "Block hash is required" });
    }

    const block = getBlockByHash(hash);
    if (!block) {
        console.error(`Block not found for hash: ${hash}`);
        return res.status(404).json({ message: `Block not found for hash: ${hash}` });
    }

    res.json({ message: "Block fetched successfully!", block });
});

app.get("/address/:address", (req, res) => {
    const address = req.params.address;

    if (!address) {
        console.error("Wallet address not provided.");
        return res.status(400).json({ message: "Address is required" });
    }

    const data = getAddressData(address);
    if (!data || data.transactions.length === 0) {
        return res.status(404).json({ message: "Address not found or has no transactions" });
    }

    res.json({ message: "Address data fetched successfully!", data });
});

// Ensure genesis block consistency
console.log("Genesis block details on server startup:");
console.log(JSON.stringify(blockchain[0], null, 2));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
