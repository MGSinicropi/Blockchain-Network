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

    if (!sender || !recipient || !amount || amount <= 0) {
        console.error("Invalid transaction data:", req.body);
        return res.status(400).json({ message: "Invalid transaction data. Ensure sender, recipient, and positive amount are provided." });
    }

    const transaction = { sender, recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Transaction added!", transaction });
});

app.get("/mine", (req, res) => {
    if (pendingTransactions.length === 0) {
        return res.status(202).json({ message: "No transactions to mine" });
    }

    try {
        const previousBlock = blockchain[blockchain.length - 1];
        const block = createBlock(previousBlock.hash, pendingTransactions);

        if (block.hash.startsWith("0".repeat(4))) {
            blockchain.push(block);
            pendingTransactions.length = 0;
            res.json({ message: "Block mined successfully!", block });
        } else {
            console.error("Mining failed: invalid block generated.");
            res.status(500).json({ message: "Mining failed: invalid block" });
        }
    } catch (error) {
        console.error("Error during block mining:", error.message);
        res.status(500).json({ message: "Internal server error during mining" });
    }
});

app.get("/chain", (req, res) => {
    if (!isValidChain(blockchain)) {
        console.error("Blockchain validation failed.");
        return res.status(500).json({ message: "Blockchain is invalid due to mismatched hashes or tampered data." });
    }
    res.json({ message: "Blockchain fetched successfully!", blockchain });
});

app.post("/register-node", (req, res) => {
    const { nodeUrl } = req.body;

    try {
        new URL(nodeUrl); // Validate URL
        nodes.add(nodeUrl);
        console.log("Node registered:", nodeUrl);
        res.json({ message: "Node registered!", nodes: Array.from(nodes) });
    } catch (err) {
        console.error("Invalid Node URL:", nodeUrl);
        res.status(400).json({ message: "Invalid Node URL. Please provide a valid URL." });
    }
});

app.post("/faucet", (req, res) => {
    const { recipient, amount } = req.body;

    if (!recipient || !amount || amount <= 0) {
        console.error("Invalid faucet transaction data:", req.body);
        return res.status(400).json({ message: "Invalid faucet transaction data. Ensure recipient and positive amount are provided." });
    }

    const transaction = { sender: "faucet", recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Faucet transaction added!", transaction });
});

// Wallet API
app.get("/wallet", (req, res) => {
    try {
        const wallet = new Wallet();
        res.json({ message: "Wallet created successfully!", address: wallet.getAddress() });
    } catch (error) {
        console.error("Error creating wallet:", error.message);
        res.status(500).json({ message: "Error creating wallet" });
    }
});

// Block Explorer
app.get("/block/:hash", (req, res) => {
    const hash = req.params.hash;

    if (!hash) {
        return res.status(400).json({ message: "Block hash is required" });
    }

    const block = getBlockByHash(hash);
    if (block) {
        res.json({ message: "Block fetched successfully!", block });
    } else {
        res.status(404).json({ message: "Block not found" });
    }
});

app.get("/address/:address", (req, res) => {
    const address = req.params.address;

    if (!address) {
        return res.status(400).json({ message: "Address is required" });
    }

    const data = getAddressData(address);
    if (data && data.transactions.length > 0) {
        res.json({ message: "Address data fetched successfully!", data });
    } else {
        res.status(404).json({ message: "Address not found or has no transactions" });
    }
});

// 404 Error Handling Middleware
app.use((req, res) => {
    console.error(`404 Error - URL not found: ${req.url}`);
    res.status(404).json({ message: "Endpoint not found" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Node running on port ${PORT}`);
});
