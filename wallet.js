import crypto from "crypto";

class Wallet {
    constructor() {
        this.keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
    }

    getAddress() {
        return this.keyPair.publicKey;
    }

    signTransaction(transaction) {
        const sign = crypto.createSign("SHA256");
        sign.update(JSON.stringify(transaction)).end();
        return sign.sign(this.keyPair.privateKey, "hex");
    }

    verifySignature(transaction, signature, publicKey) {
        const verify = crypto.createVerify("SHA256");
        verify.update(JSON.stringify(transaction));
        return verify.verify(publicKey, signature, "hex");
    }
}

// Export Wallet using ES module syntax
export { Wallet };
