const crypto = require("crypto");

class Wallet {
    constructor() {
        // Generate an RSA key pair
        this.keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
    }

    // Get the wallet's public address
    getAddress() {
        return this.keyPair.publicKey;
    }

    // Sign a transaction
    signTransaction(transaction) {
        const sign = crypto.createSign("SHA256");
        sign.update(JSON.stringify(transaction)).end();
        return sign.sign(this.keyPair.privateKey, "hex");
    }

    // Verify a transaction signature
    static verifySignature(transaction, signature, publicKey) {
        const verify = crypto.createVerify("SHA256");
        verify.update(JSON.stringify(transaction));
        return verify.verify(publicKey, signature, "hex");
    }
}

module.exports = Wallet;
