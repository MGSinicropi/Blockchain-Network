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
            return { error: `Failed to fetch from API. ${error.message}` };
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

    // Event: Mine a new block
    document.getElementById("mine-block")?.addEventListener("click", async () => {
        console.log("Mining block...");

        const block = await apiFetch(`${apiBase}/mine`);
        alert(block.error || `New block mined:\n${JSON.stringify(block, null, 2)}`);
    });

    // Event: View the blockchain
    document.getElementById("view-chain")?.addEventListener("click", async () => {
        console.log("Fetching the blockchain...");

        const chain = await apiFetch(`${apiBase}/chain`);
        const chainDisplay = document.getElementById("chain-display");
        if (chainDisplay) {
            chainDisplay.innerText = chain.error || `Blockchain:\n${JSON.stringify(chain, null, 2)}`;
        }
    });

    // Event: Register a new node
    document.getElementById("register-node-form")?.addEventListener("submit", async (event) => {
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

        alert(result.message || `Error: ${result.error}`);
    });

    // Event: Check an address balance
    document.getElementById("check-address-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const address = document.getElementById("address")?.value.trim();

        if (!address) {
            alert("Please provide a valid address!");
            return;
        }

        console.log("Fetching address data:", address);

        const data = await apiFetch(`${apiBase}/address/${address}`);
        const balanceDisplay = document.getElementById("balance-display");
        if (balanceDisplay) {
            balanceDisplay.innerText = data.error
                ? `Error: ${data.error}`
                : `Balance: ${data.balance}\nTransactions:\n${JSON.stringify(data.transactions, null, 2)}`;
        }
    });

    // Attach Event Listeners
    document.getElementById("add-transaction")?.addEventListener("click", addTransaction);
    document.getElementById("fetch-block")?.addEventListener("click", fetchBlockByHash);
});
