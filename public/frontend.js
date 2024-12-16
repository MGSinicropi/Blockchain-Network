const apiBase = "http://localhost:3000";

function displayOutput(message) {
    const outputElement = document.getElementById("output");
    outputElement.innerText = message;
}

function displayError(message) {
    const errorOutput = document.getElementById("error-output");
    errorOutput.innerText = message;
}

async function apiRequest(url, method = "GET", body = null) {
    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : null,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        displayError(error.message);
        throw error;
    }
}

async function createWallet() {
    const data = await apiRequest(`${apiBase}/wallet`);
    document.getElementById("wallet-output").innerText = `Wallet Address: ${data.address}`;
}
async function faucetTransaction() {
    const recipient = document.getElementById("faucetRecipient").value.trim();
    const amount = parseFloat(document.getElementById("faucetAmount").value);

    if (!recipient || isNaN(amount) || amount <= 0) {
        alert("Invalid faucet transaction details. Please provide a valid recipient and a positive amount.");
        return;
    }

    try {
        const response = await fetch(`${apiBase}/faucet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipient, amount }), // Ensure correct payload
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || "Faucet transaction added successfully.");
            // Clear input fields on success
            document.getElementById("faucetRecipient").value = "";
            document.getElementById("faucetAmount").value = "";
        } else {
            console.error("Faucet transaction failed:", data);
            alert(data.message || "Failed to send faucet transaction.");
        }
    } catch (error) {
        console.error("Error sending faucet transaction:", error.message);
        alert("An error occurred while sending the faucet transaction.");
    }
    console.log("Sending faucet transaction:", { recipient, amount });

}



async function addTransaction() {
    const sender = document.getElementById("sender").value.trim();
    const recipient = document.getElementById("recipient").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    await apiRequest(`${apiBase}/transaction`, "POST", { sender, recipient, amount });
    alert("Transaction added successfully!");
}

async function mineBlock() {
    const data = await apiRequest(`${apiBase}/mine`);
    displayOutput(JSON.stringify(data.block, null, 2));
}

async function fetchChain() {
    const data = await apiRequest(`${apiBase}/chain`);
    displayOutput(JSON.stringify(data.blockchain, null, 2));
}

async function fetchBlockByHash() {
    const blockHash = document.getElementById("blockHash").value.trim();
    const data = await apiRequest(`${apiBase}/block/${blockHash}`);
    displayOutput(JSON.stringify(data.block, null, 2));
}

async function fetchBalanceByAddress() {
    const address = document.getElementById("address").value.trim();

    if (!address) {
        alert("Please provide a valid wallet address.");
        return;
    }

    try {
        const response = await fetch(`${apiBase}/address/${encodeURIComponent(address)}`);
        const data = await response.json();

        if (response.ok) {
            displayOutput(
                `Balance: ${data.data.balance}\nTransactions:\n${JSON.stringify(data.data.transactions, null, 2)}`
            );
        } else {
            alert(data.message || "Address not found.");
        }
    } catch (error) {
        console.error("Error fetching balance by address:", error.message);
        alert("An error occurred while fetching the balance.");
    }
}


document.getElementById("create-wallet").addEventListener("click", createWallet);
document.getElementById("add-transaction").addEventListener("click", addTransaction);
document.getElementById("mine-block").addEventListener("click", mineBlock);
document.getElementById("view-chain").addEventListener("click", fetchChain);
document.getElementById("fetch-block").addEventListener("click", fetchBlockByHash);
document.getElementById("send-faucet").addEventListener("click", faucetTransaction);
document.getElementById("view-balance").addEventListener("click", fetchBalanceByAddress);
