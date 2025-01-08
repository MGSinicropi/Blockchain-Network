// import express from "express";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";
// import { blockchain, pendingTransactions, createBlock, addTransaction, minePendingTransactions } from "./blockchain.js";
// import { getBlockByHash, getAddressData } from "./explorer.js";
// import { Wallet } from "./wallet.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const app = express();

// // Middleware
// app.use(cors({ origin: "*" })); // Allow all origins for development
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // Content Security Policy
// app.use((req, res, next) => {
//     res.setHeader(
//         "Content-Security-Policy",
//         "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
//     );
//     next();
// });

// // Routes

// // Wallet creation
// app.get("/wallet", (req, res) => {
//     try {
//         const wallet = new Wallet();
//         const address = wallet.getAddress();
//         console.log("New wallet created:", address);
//         res.json({ address });
//     } catch (error) {
//         console.error("Error creating wallet:", error.message);
//         res.status(500).json({ message: "Failed to create wallet" });
//     }
// });

// // Add a transaction
// app.post("/transaction", (req, res) => {
//     const { sender, recipient, amount } = req.body;

//     if (!sender || !recipient || typeof amount !== "number" || amount <= 0) {
//         console.error("Invalid transaction details:", req.body);
//         return res.status(400).json({ message: "Invalid transaction details" });
//     }

//     try {
//         addTransaction({ sender, recipient, amount });
//         console.log("Transaction added:", { sender, recipient, amount });
//         res.json({ message: "Transaction added successfully!" });
//     } catch (error) {
//         console.error("Error adding transaction:", error.message);
//         res.status(500).json({ message: "Failed to add transaction" });
//     }
// });

// // Mine a block
// app.get("/mine", (req, res) => {
//     try {
//         const newBlock = minePendingTransactions();
//         console.log("Block mined successfully:", newBlock);
//         res.json({ message: "Block mined successfully!", block: newBlock });
//     } catch (error) {
//         console.error("Error during mining:", error.message);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Fetch the entire blockchain
// app.get("/chain", (req, res) => {
//     console.log("Fetching blockchain...");
//     res.json({ blockchain });
// });

// // Fetch a block by hash
// app.get("/block/:hash", (req, res) => {
//     const { hash } = req.params;

//     if (!hash) {
//         console.error("Block hash is required.");
//         return res.status(400).json({ message: "Block hash is required" });
//     }

//     const block = getBlockByHash(hash);
//     if (!block) {
//         console.error(`Block not found for hash: ${hash}`);
//         return res.status(404).json({ message: `Block not found for hash: ${hash}` });
//     }

//     console.log("Block fetched successfully:", block);
//     res.json({ block });
// });

// // Fetch wallet data by address
// app.get("/address/:address", (req, res) => {
//     const address = decodeURIComponent(req.params.address);

//     console.log("Fetching balance for address:", address); // Debug log

//     if (!/^[A-Za-z0-9+/=]+$/.test(address)) {
//         console.error(`Invalid address format: ${address}`);
//         return res.status(400).json({ message: "Invalid address format" });
//     }

//     const data = getAddressData(address);
//     if (!data || data.transactions.length === 0) {
//         console.error(`No transactions found for address: ${address}`);
//         return res.status(404).json({ message: "Address not found or has no transactions" });
//     }

//     console.log("Address data fetched successfully:", data);
//     res.json({ data });
// });

// // Faucet to send test tokens
// app.post("/faucet", (req, res) => {
//     const { recipient, amount } = req.body;

//     console.log("Faucet transaction request received:", req.body); // Debug log

//     if (!recipient || typeof amount !== "number" || amount <= 0) {
//         console.error("Invalid faucet transaction details:", req.body);
//         return res.status(400).json({ message: "Invalid faucet transaction details" });
//     }

//     try {
//         const transaction = { sender: "faucet", recipient, amount };
//         pendingTransactions.push(transaction);
//         console.log("Faucet transaction added successfully:", transaction); // Debug log
//         res.json({ message: "Faucet transaction added successfully!", transaction });
//     } catch (error) {
//         console.error("Error processing faucet transaction:", error.message);
//         res.status(500).json({ message: "Internal server error while processing the faucet transaction" });
//     }
//     console.log("Faucet transaction request received:", req.body);

// });




// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
