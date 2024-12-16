document.addEventListener("DOMContentLoaded", () => {
    const apiBase = "http://localhost:3000";

    // General API Fetch Wrapper
    async function apiFetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Fetch Error: ${error.message}`, { url, options });
            updateOutput(`Error: ${error.message}`);
            return { error: `Failed to fetch data. ${error.message}` };
        }
    }

    // Update the output display
    function updateOutput(message) {
        const outputElement = document.getElementById("output");
        if (outputElement) {
            outputElement.innerText = message;
        }
    }

    // Adds a transaction
    async function addTransaction() {
        const sender = document.getElementById("sender")?.value.trim();
        const recipient = document.getElementById("recipient")?.value.trim();
        const amount = parseFloat(document.getElementById("amount")?.value);

        if (!sender || !recipient || isNaN(amount) || amount <= 0) {
            updateOutput("Invalid transaction details. Please provide all fields correctly.");
            return;
        }

        console.log("Submitting transaction:", { sender, recipient, amount });

        const data = await apiFetch(`${apiBase}/transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender, recipient, amount }),
        });

        updateOutput(data.error || `Transaction added:\n${JSON.stringify(data, null, 2)}`);
    }

    // Fetches block by hash
    async function fetchBlockByHash() {
        const blockHash = document.getElementById("blockHash")?.value.trim();
        if (!blockHash) {
            updateOutput("Please provide a valid block hash!");
            return;
        }

        console.log("Fetching block by hash:", blockHash);

        const data = await apiFetch(`${apiBase}/block/${blockHash}`);
        updateOutput(data.error || `Block details:\n${JSON.stringify(data, null, 2)}`);
    }

    // Mines a block
    async function mineBlock() {
        console.log("Mining block...");

        const data = await apiFetch(`${apiBase}/mine`);
        updateOutput(data.error || `New block mined:\n${JSON.stringify(data, null, 2)}`);
    }

    // Fetches the entire blockchain
    async function fetchChain() {
        console.log("Fetching the blockchain...");

        const data = await apiFetch(`${apiBase}/chain`);
        updateOutput(data.error || `Blockchain:\n${JSON.stringify(data, null, 2)}`);
    }

    // Registers a new node
    async function registerNode(event) {
        event.preventDefault();
        const nodeUrl = document.getElementById("node-url")?.value.trim();

        if (!/^https?:\/\/.+/.test(nodeUrl)) {
            alert("Invalid URL format. Please include 'http://' or 'https://'.");
            return;
        }

        console.log("Registering node:", nodeUrl);

        const result = await apiFetch(`${apiBase}/register-node`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodeUrl }),
        });

        updateOutput(result.message || `Error: ${result.error}`);
    }

    // Fetches the balance and transaction history of an address
    async function fetchBalanceByAddress(event) {
        event.preventDefault();
        const address = document.getElementById("address")?.value.trim();

        if (!address) {
            updateOutput("Please provide a valid address!");
            return;
        }

        console.log("Fetching address data:", address);

        const data = await apiFetch(`${apiBase}/address/${address}`);
        updateOutput(
            data.error ||
                `Balance: ${data.balance}\nTransactions:\n${JSON.stringify(data.transactions, null, 2)}`
        );
    }

    // Faucet transaction
    async function faucetTransaction() {
        const recipient = document.getElementById("faucetRecipient")?.value.trim();
        const amount = parseFloat(document.getElementById("faucetAmount")?.value);

        if (!recipient || isNaN(amount) || amount <= 0) {
            updateOutput("Invalid faucet transaction details. Provide a valid recipient and positive amount.");
            return;
        }

        console.log("Submitting faucet transaction:", { recipient, amount });

        const data = await apiFetch(`${apiBase}/faucet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipient, amount }),
        });

        updateOutput(data.error || `Faucet transaction added:\n${JSON.stringify(data, null, 2)}`);
    }

    // Attach Event Listeners to Buttons
    document.getElementById("add-transaction")?.addEventListener("click", addTransaction);
    document.getElementById("fetch-block")?.addEventListener("click", fetchBlockByHash);
    document.getElementById("mine-block")?.addEventListener("click", mineBlock);
    document.getElementById("view-chain")?.addEventListener("click", fetchChain);
    document.getElementById("register-node-form")?.addEventListener("submit", registerNode);
    document.getElementById("check-address-form")?.addEventListener("submit", fetchBalanceByAddress);
    document.getElementById("faucetTransaction")?.addEventListener("click", faucetTransaction);
});
