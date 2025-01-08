const apiBase = "http://localhost:3000";

// Utility: Display output messages
function displayOutput(message) {
    const outputElement = document.getElementById("output");
    outputElement.innerText = message;
}

// Utility: Display error messages
function displayError(message) {
    const errorOutput = document.getElementById("error-output");
    errorOutput.innerText = message;
}

// Utility: Make API requests with error handling
async function apiRequest(url, method = "GET", body = null) {
    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : null,
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
            return await response.json();
        } else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "API request failed");
        }

        throw new Error("Unexpected response format");
    } catch (error) {
        displayError(error.message || "An unexpected error occurred");
        throw error;
    }
}

// Create Wallet
async function createWallet() {
    try {
        const data = await apiRequest(`${apiBase}/wallet`);
        const walletAddress = data.address;
        document.getElementById("wallet-output").innerText = `Wallet Address: ${walletAddress}`;
    } catch (error) {
        console.error("Error creating wallet:", error.message);
    }
}

// Faucet Transaction
async function faucetTransaction() {
    const recipient = document.getElementById("faucetRecipient").value.trim();
    const amount = parseFloat(document.getElementById("faucetAmount").value);

    if (!recipient || isNaN(amount) || amount <= 0) {
        alert("Invalid faucet transaction details. Please provide a valid recipient and a positive amount.");
        return;
    }

    try {
        const data = await apiRequest(`${apiBase}/faucet`, "POST", { recipient, amount });
        alert(data.message || "Faucet transaction completed successfully.");
        document.getElementById("faucetRecipient").value = "";
        document.getElementById("faucetAmount").value = "";
    } catch (error) {
        console.error("Error sending faucet transaction:", error.message);
    }
}

// Add Transaction
async function addTransaction() {
    const sender = document.getElementById("sender").value.trim();
    const recipient = document.getElementById("recipient").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    if (!sender || !recipient || isNaN(amount) || amount <= 0) {
        alert("Invalid transaction details. Please provide valid sender, recipient, and a positive amount.");
        return;
    }

    try {
        const data = await apiRequest(`${apiBase}/transaction`, "POST", { sender, recipient, amount });
        alert(data.message || "Transaction added successfully.");
    } catch (error) {
        console.error("Error adding transaction:", error.message);
    }
}

// Mine Block
async function mineBlock() {
    try {
        const data = await apiRequest(`${apiBase}/mine`, "POST");
        displayOutput(`Mined Block:\n${JSON.stringify(data.block, null, 2)}`);
    } catch (error) {
        console.error("Error mining block:", error.message);
    }
}

// Fetch Blockchain
async function fetchChain() {
    try {
        const data = await apiRequest(`${apiBase}/chain`);
        displayOutput(`Blockchain:\n${JSON.stringify(data.blockchain, null, 2)}`);
    } catch (error) {
        console.error("Error fetching blockchain:", error.message);
    }
}

// Fetch Block by Hash
async function fetchBlockByHash() {
    const blockHash = document.getElementById("blockHash").value.trim();

    if (!blockHash) {
        alert("Please provide a valid block hash.");
        return;
    }

    try {
        const data = await apiRequest(`${apiBase}/block/${encodeURIComponent(blockHash)}`);
        displayOutput(`Block Details:\n${JSON.stringify(data.block, null, 2)}`);
    } catch (error) {
        console.error("Error fetching block by hash:", error.message);
    }
}

// Fetch Wallet Balance
async function fetchBalanceByAddress() {
    const addressInput = document.getElementById("address").value.trim();
    if (!addressInput) {
        alert("Please provide a valid wallet address.");
        return;
    }

    try {
        const data = await apiRequest(`${apiBase}/address/${encodeURIComponent(addressInput)}`);
        displayOutput(
            `Balance: ${data.balance}\nTransactions:\n${JSON.stringify(data.transactions, null, 2)}`
        );
    } catch (error) {
        console.error("Error fetching wallet balance:", error.message);
    }
}

// Add Node
async function addNode() {
    const nodeUrl = document.getElementById("nodeUrl").value.trim();
    if (!nodeUrl) {
        alert("Please provide a valid Node URL.");
        return;
    }

    try {
        const data = await apiRequest(`${apiBase}/add-node`, "POST", { nodeUrl });
        displayOutput(`Node added successfully. Current Nodes:\n${JSON.stringify(data.nodes, null, 2)}`);
    } catch (error) {
        console.error("Error adding node:", error.message);
    }
}

// Sync Nodes
async function syncNodes() {
    try {
        const data = await apiRequest(`${apiBase}/sync`);
        displayOutput(`Synchronization complete. Blockchain:\n${JSON.stringify(data.blockchain, null, 2)}`);
    } catch (error) {
        console.error("Error syncing nodes:", error.message);
    }
}

// Event Listeners
document.getElementById("create-wallet").addEventListener("click", createWallet);
document.getElementById("send-faucet").addEventListener("click", faucetTransaction);
document.getElementById("add-transaction").addEventListener("click", addTransaction);
document.getElementById("mine-block").addEventListener("click", mineBlock);
document.getElementById("view-chain").addEventListener("click", fetchChain);
document.getElementById("fetch-block").addEventListener("click", fetchBlockByHash);
document.getElementById("view-balance").addEventListener("click", fetchBalanceByAddress);
document.getElementById("add-node").addEventListener("click", addNode);
document.getElementById("sync-nodes").addEventListener("click", syncNodes);
//Clear fields on page refresh
function clearFieldsOnRefresh() {
    const inputFields = document.querySelectorAll("input[type='text'], input[type='number']");
    inputFields.forEach((input) => {
        input.value = ""; // Clear the input field
    });

    // Clear output and error display areas
    document.getElementById("output").innerText = "";
    document.getElementById("error-output").innerText = "";
}

// Attach the clearFieldsOnRefresh function to the window's onload event
window.onload = clearFieldsOnRefresh;
