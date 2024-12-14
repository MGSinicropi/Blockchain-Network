// Explorer Module
function setupExplorer(app) {
    // Display the latest blocks
    app.get("/explorer/latest-blocks", (req, res) => {
        const latestBlocks = blockchain.slice(-10); // Fetch the last 10 blocks
        res.json(latestBlocks);
    });

    // Display specific block information
    app.get("/explorer/block/:hash", (req, res) => {
        const block = blockchain.find((b) => b.hash === req.params.hash);
        if (block) res.json(block);
        else res.status(404).json({ message: "Block not found" });
    });

    // Display transaction details
    app.get("/explorer/transaction/:id", (req, res) => {
        const transactions = blockchain.flatMap((block) => block.transactions);
        const transaction = transactions.find((tx) => tx.id === req.params.id);
        if (transaction) res.json(transaction);
        else res.status(404).json({ message: "Transaction not found" });
    });

    // Display balance for a specific address
    app.get("/explorer/address/:address", (req, res) => {
        const transactions = blockchain.flatMap((block) => block.transactions).filter(
            (tx) => tx.sender === req.params.address || tx.recipient === req.params.address
        );

        const balance = transactions.reduce(
            (acc, tx) =>
                tx.recipient === req.params.address
                    ? acc + tx.amount
                    : acc - tx.amount,
            0
        );

        res.json({ transactions, balance });
    });
}

module.exports = { setupExplorer };
