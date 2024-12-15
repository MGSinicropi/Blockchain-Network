document.addEventListener("DOMContentLoaded", () => {
    const apiBase = "http://localhost:3000";

    async function apiFetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Fetch Error: ${error.message}`);
            return { error: `Failed to fetch data. ${error.message}` };
        }
    }

    async function addTransaction() {
        const sender = document.getElementById("sender")?.value.trim();
        const recipient = document.getElementById("recipient")?.value.trim();
        const amount = parseFloat(document.getElementById("amount")?.value);

        if (!sender || !recipient || isNaN(amount) || amount <= 0) {
            document.getElementById("output").innerText =
                "Invalid transaction details. Please fill out all fields correctly.";
            return;
        }

        console.log("Submitting transaction:", { sender, recipient, amount });

        const data = await apiFetch(`${apiBase}/transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender, recipient, amount }),
        });

        document.getElementById("output").innerText =
            data.error || `Transaction added:\n${JSON.stringify(data, null, 2)}`;
    }

    async function fetchBlockByHash() {
        const blockHash = document.getElementById("blockHash")?.value.trim();
        if (!blockHash) {
            document.getElementById("output").innerText =
                "Please provide a valid block hash!";
            return;
        }

        console.log("Fetching block with hash:", blockHash);

        const data = await apiFetch(`${apiBase}/block/${blockHash}`);
        document.getElementById("output").innerText =
            data.error || JSON.stringify(data, null, 2);
    }

    document.getElementById("mine-block")?.addEventListener("click", async () => {
        console.log("Mining block...");
        const block = await apiFetch(`${apiBase}/mine`);
        alert(block.error || `New block mined:\n${JSON.stringify(block, null, 2)}`);
    });

    document.getElementById("view-chain")?.addEventListener("click", async () => {
        console.log("Fetching blockchain...");
        const chain = await apiFetch(`${apiBase}/chain`);
        document.getElementById("chain-display").innerText =
            chain.error || JSON.stringify(chain, null, 2);
    });

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

    document.getElementById("check-address-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const address = document.getElementById("address")?.value.trim();
        if (!address) {
            alert("Please provide a valid address!");
            return;
        }

        console.log("Fetching data for address:", address);

        const data = await apiFetch(`${apiBase}/address/${address}`);
        const balanceDisplay = document.getElementById("balance-display");
        balanceDisplay.innerText = data.error
            ? `Error: ${data.error}`
            : `Balance: ${data.balance}\nTransactions:\n${JSON.stringify(
                  data.transactions,
                  null,
                  2
              )}`;
    });

    document.getElementById("add-transaction")?.addEventListener("click", addTransaction);
    document.getElementById("fetch-block")?.addEventListener("click", fetchBlockByHash);
});
