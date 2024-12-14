// app.js
const express = require("express");
const bodyParser = require("body-parser");
app.use(express.static("public"));

const { blockchain, pendingTransactions, createBlock } = require("./blockchain");
const { Wallet } = require("./wallet");
const { getBlockByHash, getAddressData } = require("./explorer");
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const cors = require("cors");
app.use(cors());

const app = express();
app.use(bodyParser.json());

let nodes = new Set();

// REST API
app.post("/transaction", (req, res) => {
    const { sender, recipient, amount } = req.body;
    const transaction = { sender, recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Transaction added!" });
});

app.get("/mine", (req, res) => {
    const previousBlock = blockchain[blockchain.length - 1];
    const block = createBlock(previousBlock.hash, pendingTransactions);
    blockchain.push(block);
    pendingTransactions.length = 0;
    res.json(block);
});

app.get("/chain", (req, res) => {
    res.json(blockchain);
});

app.post("/register-node", (req, res) => {
    const { nodeUrl } = req.body;
    nodes.add(nodeUrl);
    res.json({ message: "Node registered!" });
});

app.post("/faucet", (req, res) => {
    const { recipient, amount } = req.body;
    pendingTransactions.push({ sender: "faucet", recipient, amount });
    res.json({ message: "Faucet transaction added!" });
});

// Block Explorer
app.get("/block/:hash", (req, res) => {
    const block = getBlockByHash(req.params.hash);
    if (block) res.json(block);
    else res.status(404).json({ message: "Block not found" });
});

app.get("/address/:address", (req, res) => {
    const data = getAddressData(req.params.address);
    res.json(data);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Node running on port ${PORT}`);
});
