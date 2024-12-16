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
        return crypto.createHash("sha256").update(this.keyPair.publicKey).digest("hex");
    }

    getPublicKey() {
        return this.keyPair.publicKey;
    }

    getPrivateKey() {
        return this.keyPair.privateKey;
    }

    signMessage(message) {
        const signature = crypto.sign("sha256", Buffer.from(message), {
            key: this.keyPair.privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        });
        return signature.toString("base64");
    }

    static verifyMessage(message, signature, publicKey) {
        return crypto.verify(
            "sha256",
            Buffer.from(message),
            { key: publicKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING },
            Buffer.from(signature, "base64")
        );
    }
}

export { Wallet };
