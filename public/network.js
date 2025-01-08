import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fetch from "node-fetch";
import cors from "cors";
import { blockchain, addTransaction, minePendingTransactions, createBlock } from "./blockchain.js";
import { Wallet } from "./wallet.js";

// Track faucet requests
const faucetTracker = new Map();

const app = express();
const port = process.env.PORT || 3000;
const nodes = new Set();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Helper: Validate faucet requests
function canRequestFaucet(address, amount) {
    const now = Date.now();
    const FAUCET_LIMIT_COINS = 50; // Max coins per day
    const FAUCET_LIMIT_REQUESTS = 5; // Max requests per day
    const FAUCET_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

    if (!faucetTracker.has(address)) {
        faucetTracker.set(address, { totalCoins: 0, requestCount: 0, resetTime: now + FAUCET_PERIOD_MS });
    }

    const tracker = faucetTracker.get(address);

    if (now > tracker.resetTime) {
        tracker.totalCoins = 0;
        tracker.requestCount = 0;
        tracker.resetTime = now + FAUCET_PERIOD_MS;
    }

    if (tracker.totalCoins + amount > FAUCET_LIMIT_COINS || tracker.requestCount >= FAUCET_LIMIT_REQUESTS) {
        return false;
    }

    tracker.totalCoins += amount;
    tracker.requestCount += 1;
    return true;
}

// Helper: Validate a blockchain
function isValidChain(chain) {
    const genesisBlock = chain[0];
    const localGenesisBlock = blockchain[0];

    if (
        genesisBlock.index !== localGenesisBlock.index ||
        genesisBlock.hash !== localGenesisBlock.hash ||
        genesisBlock.previousHash !== localGenesisBlock.previousHash ||
        genesisBlock.merkleRoot !== localGenesisBlock.merkleRoot
    ) {
        return false;
    }

    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        if (
            currentBlock.previousHash !== previousBlock.hash ||
            currentBlock.hash !== createBlock(currentBlock.previousHash, currentBlock.transactions).hash
        ) {
            return false;
        }
    }

    return true;
}

// Route: Create a new wallet
app.get("/wallet", (req, res) => {
    try {
        const wallet = new Wallet();
        res.json({ address: wallet.getAddress() });
    } catch (error) {
        console.error("Error creating wallet:", error.message);
        res.status(500).json({ message: "Failed to create wallet" });
    }
});

// Route: Add a new node to the network and propagate
app.post("/add-node", async (req, res) => {
    const { nodeUrl } = req.body;

    if (!nodeUrl) {
        return res.status(400).json({ message: "Node URL is required" });
    }

    if (nodes.has(nodeUrl)) {
        return res.status(400).json({ message: "Node already exists in the network" });
    }

    nodes.add(nodeUrl);

    const propagationPromises = Array.from(nodes).map(async (existingNode) => {
        if (existingNode !== nodeUrl) {
            try {
                await fetch(`${existingNode}/add-node`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nodeUrl }),
                });
            } catch (error) {
                console.error(`Failed to propagate node to ${existingNode}:`, error.message);
            }
        }
    });

    try {
        await fetch(`${nodeUrl}/add-node`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodeUrl: `http://localhost:${port}` }),
        });
    } catch (error) {
        console.error(`Failed to add local node to ${nodeUrl}:`, error.message);
    }

    await Promise.all(propagationPromises);

    res.json({
        message: "Node added successfully and propagated to the network",
        nodes: Array.from(nodes),
    });
});

// Route: Synchronize blockchain with other nodes
app.get("/sync", async (req, res) => {
    try {
        for (const node of nodes) {
            try {
                const response = await fetch(`${node}/chain`);
                if (!response.ok) {
                    console.error(`Failed to fetch chain from ${node}`);
                    continue;
                }

                const { blockchain: remoteChain } = await response.json();

                if (remoteChain && remoteChain.length > blockchain.length && isValidChain(remoteChain)) {
                    console.log(`Replacing local chain with chain from ${node}`);
                    blockchain.splice(0, blockchain.length, ...remoteChain);
                }
            } catch (error) {
                console.error(`Failed to sync with node ${node}:`, error.message);
            }
        }

        res.json({ message: "Synchronization complete", blockchain });
    } catch (error) {
        console.error("Error during synchronization:", error.message);
        res.status(500).json({ message: "Failed to sync nodes" });
    }
});

// Route: Faucet Transaction with limits
app.post("/faucet", (req, res) => {
    const { recipient, amount } = req.body;

    if (!recipient || amount <= 0) {
        return res.status(400).json({ message: "Invalid faucet request" });
    }

    if (!canRequestFaucet(recipient, amount)) {
        return res.status(429).json({ message: "You have exceeded the faucet limit of 50 tokens. Please try again in 24 hours." });
    }

    try {
        addTransaction({ sender: "FAUCET", recipient, amount });
        res.status(200).json({ message: `Faucet funds sent to ${recipient}` });
    } catch (error) {
        console.error("Error processing faucet transaction:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route: Add a new transaction
app.post("/transaction", (req, res) => {
    const { sender, recipient, amount } = req.body;

    if (!sender || !recipient || amount <= 0) {
        return res.status(400).json({ message: "Invalid transaction data" });
    }

    try {
        addTransaction({ sender, recipient, amount });
        res.json({ message: "Transaction added successfully" });
    } catch (error) {
        console.error("Error adding transaction:", error.message);
        res.status(500).json({ message: "Failed to add transaction" });
    }
});

// Route: Mine pending transactions
app.post("/mine", (req, res) => {
    try {
        const block = minePendingTransactions();

        nodes.forEach(async (node) => {
            try {
                await fetch(`${node}/add-block`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(block),
                });
            } catch (error) {
                console.error(`Failed to broadcast block to node ${node}:`, error.message);
            }
        });

        res.json({ message: "Block mined and broadcasted", block });
    } catch (error) {
        console.error("Error mining block:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Route: Add a block from another node
app.post("/add-block", (req, res) => {
    const block = req.body;

    const lastBlock = blockchain[blockchain.length - 1];
    if (
        lastBlock.hash !== block.previousHash ||
        block.hash !== createBlock(block.previousHash, block.transactions).hash
    ) {
        return res.status(400).json({ message: "Invalid block" });
    }

    blockchain.push(block);
    res.json({ message: "Block added successfully", block });
});

// Route: Get the full blockchain
app.get("/chain", (req, res) => {
    res.json({ blockchain });
});

// Route: Fetch block by hash
app.get("/block/:hash", (req, res) => {
    const { hash } = req.params;

    const block = blockchain.find((b) => b.hash === hash);

    if (!block) {
        return res.status(404).json({ message: "Block not found" });
    }

    res.json({ block });
});

// Route: Get balance and transactions by wallet address
app.get("/address/:address", (req, res) => {
    const { address } = req.params;

    if (!address) {
        return res.status(400).json({ message: "Invalid wallet address" });
    }

    let balance = 0;
    const transactions = [];

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
            }
            if (transaction.recipient === address) {
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
        return res.status(404).json({
            message: "Address not found or no transactions for this address",
            balance: 0,
            transactions: [],
        });
    }

    res.json({
        message: "Balance and transactions retrieved successfully",
        balance,
        transactions,
    });
});

// Serve static files
const __dirname = path.resolve();
app.use(express.static(__dirname));

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Start the server
app.listen(port, () => {
    console.log(`Node listening on port ${port}`);
});
