const apiBase = "http://localhost:3000";

async function createWallet() {
  const response = await fetch(`${apiBase}/wallet`);
  const data = await response.json();
  document.getElementById("wallet-output").innerText = `Wallet Address: ${data.address}`;
}

async function addTransaction() {
  const sender = document.getElementById("sender").value;
  const recipient = document.getElementById("recipient").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const response = await fetch(`${apiBase}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, recipient, amount }),
  });
  const data = await response.json();
  alert(data.message);
}

async function mineBlock() {
  const response = await fetch(`${apiBase}/mine`);
  const data = await response.json();
  alert(data.message);
}

async function fetchChain() {
  const response = await fetch(`${apiBase}/chain`);
  const data = await response.json();
  document.getElementById("chain-output").innerText = JSON.stringify(data.blockchain, null, 2);
}
