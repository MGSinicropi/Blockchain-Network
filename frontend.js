document.addEventListener("DOMContentLoaded", () => {
    // Submit a transaction
    document.getElementById("transaction-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const sender = document.getElementById("sender").value;
        const recipient = document.getElementById("recipient").value;
        const amount = document.getElementById("amount").value;

        const response = await fetch("/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender, recipient, amount }),
        });
        const result = await response.json();
        alert(result.message);
    });

    // Mine a block
    document.getElementById("mine-block").addEventListener("click", async () => {
        const response = await fetch("/mine");
        const block = await response.json();
        alert(`New block mined:\n${JSON.stringify(block, null, 2)}`);
    });

    // View blockchain
    document.getElementById("view-chain").addEventListener("click", async () => {
        const response = await fetch("/chain");
        const chain = await response.json();
        const chainDisplay = document.getElementById("chain-display");
        chainDisplay.innerText = JSON.stringify(chain, null, 2);
    });

    // Register a node
    document.getElementById("register-node-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nodeUrl = document.getElementById("node-url").value;

        const response = await fetch("/register-node", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodeUrl }),
        });
        const result = await response.json();
        alert(result.message);
    });

    // Check address details
    document.getElementById("check-address-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const address = document.getElementById("address").value;

        const response = await fetch(`/address/${address}`);
        const data = await response.json();
        const balanceDisplay = document.getElementById("balance-display");
        balanceDisplay.innerText = `Balance: ${data.balance}\nTransactions:\n${JSON.stringify(data.transactions, null, 2)}`;
    });
});
