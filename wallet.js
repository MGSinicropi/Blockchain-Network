const crypto = require("crypto");
const fs = require("fs");

class Wallet {
    constructor(existingPrivateKey = null) {
        // Load existing private key or generate a new one
        if (existingPrivateKey) {
            this.keyPair = {
                privateKey: existingPrivateKey,
                publicKey: crypto.createPublicKey(existingPrivateKey).export({ type: "spki", format: "pem" }),
            };
        } else {
            this.keyPair = crypto.generateKeyPairSync("rsa", {
                modulusLength: 2048,
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
            });
        }
    }

    // Returns the hashed address of the wallet
    getAddress() {
        const hash = crypto.createHash("sha256");
        hash.update(this.keyPair.publicKey);
        return hash.digest("hex");
    }

    // Signs a transaction using the private key
    signTransaction(transaction) {
        const sign = crypto.createSign("SHA256");
        sign.update(JSON.stringify(transaction)).end();
        return sign.sign(this.keyPair.privateKey, "hex");
    }

    // Verifies a signature using the provided public key
    verifySignature(transaction, signature, publicKey) {
        const verify = crypto.createVerify("SHA256");
        verify.update(JSON.stringify(transaction));
        return verify.verify(publicKey, signature, "hex");
    }

    // Save the private key to a file
    savePrivateKey(filePath) {
        fs.writeFileSync(filePath, this.keyPair.privateKey, { encoding: "utf8" });
    }

    // Static method to load a wallet from a private key file
    static loadFromPrivateKeyFile(filePath) {
        const privateKey = fs.readFileSync(filePath, { encoding: "utf8" });
        return new Wallet(privateKey);
    }
}

module.exports = { Wallet };
