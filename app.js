const express = require("express");
const bodyParser = require("body-parser");
const { blockchain, pendingTransactions, nodes, createBlock, mine } = require("./blockchain");
const Wallet = require("./wallet");
const ownerWallet = new Wallet();
console.log("Owner Address:", ownerWallet.getAddress());

const app = express();
app.use(bodyParser.json());

// REST API Endpoints
app.post("/transaction", (req, res) => {
    const { sender, recipient, amount } = req.body;
    const transaction = { sender, recipient, amount };
    pendingTransactions.push(transaction);
    res.json({ message: "Transaction added!" });
});

app.get("/mine", (req, res) => {
    mine();
    res.json(blockchain[blockchain.length - 1]);
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Node running on port ${PORT}`);
});
