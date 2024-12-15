// app.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { blockchain, pendingTransactions, createBlock } = require("./blockchain");
const { Wallet } = require("./wallet");
const { getBlockByHash, getAddressData } = require("./explorer");

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let nodes = new Set();

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}, Method: ${req.method}, Body:`, req.body);
    next();
});

// REST API
app.post("/transaction", (req, res) => {
    const { sender, recipient, amount } = req.body;
    if (!sender || !recipient || !amount) {
        return res.status(400).json({ message: "Invalid transaction data" });
    }
    const transaction = { sender, recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Transaction added!", transaction });
});
app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/mine", (req, res) => {
    if (pendingTransactions.length === 0) {
        return res.status(202).json({ message: "No transactions to mine" });
    }
    const previousBlock = blockchain[blockchain.length - 1];
    const block = createBlock(previousBlock.hash, pendingTransactions);

     if (!isValidBlock(block, previousBlock)) {
        return res.status(500).json({ message: "Mining failed due to block validation error" });
    }

    blockchain.push(block);
    pendingTransactions.length = 0;
    res.json({ message: "Block mined successfully!", block });
});

app.get("/chain", (req, res) => {
    res.json({ message: "Blockchain fetched successfully!", blockchain });
});

app.post("/register-node", (req, res) => {
    const { nodeUrl } = req.body;
    if (!nodeUrl) {
        return res.status(400).json({ message: "Node URL is required" });
    }
    nodes.add(nodeUrl);
    res.json({ message: "Node registered!" });
    const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};
if (!isValidUrl(nodeUrl)) {
    return res.status(400).json({ message: "Invalid Node URL" });
}

});

app.post("/faucet", (req, res) => {
    const { recipient, amount } = req.body;
    if (!recipient || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid faucet transaction data" });
    }
    const transaction = { sender: "faucet", recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Faucet transaction added!", transaction });
});

// Wallet API
app.get("/wallet", (req, res) => {
    const wallet = new Wallet();
    res.json({ message: "Wallet created successfully!", address: wallet.getAddress() });
});

// Block Explorer
app.get("/block/:hash", (req, res) => {
    const block = getBlockByHash(req.params.hash);
    if (block) res.json({ message: "Block fetched successfully!", block });
    else res.status(404).json({ message: "Block not found" });
});

app.get("/address/:address", (req, res) => {
    const data = getAddressData(req.params.address);
    if (data.transactions.length === 0) {
        return res.status(404).json({ message: "Address not found or has no transactions" });
    }
    res.json({ message: "Address data fetched successfully!", data });
});

// 404 Error Handling Middleware
app.use((req, res) => {
    console.log(`404 Error - URL not found: ${req.url}`);
    res.status(404).json({ message: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Node running on port ${PORT}`);
});
