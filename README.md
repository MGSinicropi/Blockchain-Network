Blockchain Explorer Group Project
Overview

This project demonstrates a simplified blockchain implementation with features such as wallet creation, transaction handling, block mining, and node synchronization. The project also includes a faucet mechanism to distribute tokens and a front-end interface for interacting with the blockchain.

Features:

    Blockchain Functionality:
        Node synchronization across multiple instances.
        Transaction handling with basic validation.
        Mining blocks with pending transactions.
        Chain integrity validation.

    Wallet:
        Public-private key generation.
        Wallet address derived using SHA-256 hashing.
        Transaction signing functionality.

    Faucet:
        Controlled token distribution.
        Daily request and coin limits.

    Explorer Interface:
        View blockchain and block details.
        Fetch transaction and wallet balance information.
        User-friendly frontend for interaction.

Bonus Features:

    Token distribution limits implemented with cool-down periods.
    Synchronization of nodes across the network.
    User-friendly interface with error and output messages.

Installation
Requirements:

    Node.js (v14+ recommended)
    npm (Node Package Manager)


Steps:

Clone the repository:

git clone <repository-url>
cd blockchain-explorer

Install dependencies:

npm install

Start the server:

node network.js

Open multiple nodes (optional):

    Run additional instances of the server by specifying a different port:

        PORT=3001 node network.js
        PORT=3002 node network.js

    Access the front-end:
        Open your browser and navigate to http://localhost:3000.

Usage
Wallet:

    Create a wallet by clicking the Create Wallet button.
    Use the generated wallet address to send or receive tokens.

Faucet:

    Enter the recipient wallet address and amount in the Faucet section.
    Request tokens, adhering to the daily limits.

Transactions:

    Specify the sender, recipient, and amount in the Add Transaction section.
    Add the transaction to the pool.
    Merkle Tree functionality via the use of merkleRoot in each block.
    The merkleRoot provides a succinct and secure way to validate transactions without storing the full Merkle Tree, which is a standard practice in many blockchain implementations.

Mining:

    Mine a block by clicking Mine Block to include pending transactions.

Blockchain Exploration:

    View the blockchain using View Blockchain.
    Fetch specific block details by entering a hash in Fetch Block.
    Check wallet balance and transaction history via View Balance.

Node Management:

    Add a node using its URL via the Add Node section.
    Sync the blockchain with connected nodes using Sync Nodes.

Code Structure

    index.html: Front-end structure and styling.
    frontend.js: Client-side JavaScript for interaction with the API.
    network.js: Server-side code handling blockchain operations and API routes.
    blockchain.js: Core blockchain logic (blocks, transactions, and chain management).
    wallet.js: Wallet creation and transaction signing.
    explorer.js: Utility functions for block and transaction exploration.

Limitations

    Currently, basic validation mechanisms are in place but lack cryptographic proofs (e.g., PoW).
    Dynamic difficulty adjustment for mining is not implemented.
    No persistent storage; blockchain data resets on server restart.

Future Improvements

    Implement dynamic block difficulty for mining.
    Enhance miner efficiency with multithreading or GPU support.
    Add more advanced explorer features, such as comments on blocks or transactions.
    Support hierarchical deterministic wallets (HD wallets).

