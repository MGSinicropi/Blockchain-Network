import express from "express";
import bodyParser from "body-parser";
import { blockchain, pendingTransactions, createBlock, isValidChain } from "./blockchain.js";
import { Wallet } from "./wallet.js";

const app = express();
app.use(bodyParser.json());

app.post("/transaction", (req, res) => {
  const { sender, recipient, amount } = req.body;
  if (!sender || !recipient || amount <= 0) {
    return res.status(400).json({ message: "Invalid transaction details" });
  }
  pendingTransactions.push({ sender, recipient, amount });
  res.json({ message: "Transaction added successfully!" });
});

app.get("/mine", (req, res) => {
  if (pendingTransactions.length === 0) {
    return res.status(400).json({ message: "No transactions to mine" });
  }
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = createBlock(previousBlock.hash, [...pendingTransactions]);
  blockchain.push(newBlock);
  pendingTransactions.length = 0;
  res.json({ message: "Block mined successfully", block: newBlock });
});

app.get("/chain", (req, res) => {
  if (!isValidChain(blockchain)) {
    return res.status(500).json({ message: "Blockchain is invalid" });
  }
  res.json({ blockchain });
});

app.get("/wallet", (req, res) => {
  const wallet = new Wallet();
  res.json({ address: wallet.getAddress() });
});

app.get("/address/:address", (req, res) => {
  const address = req.params.address;
  let balance = 0;
  const transactions = [];
  blockchain.forEach((block) => {
    block.transactions.forEach((tx) => {
      if (tx.sender === address) {
        balance -= tx.amount;
        transactions.push({ type: "sent", amount: tx.amount });
      } else if (tx.recipient === address) {
        balance += tx.amount;
        transactions.push({ type: "received", amount: tx.amount });
      }
    });
  });
  res.json({ balance, transactions });
});

app.listen(3000, () => console.log("Blockchain node running on port 3000"));
