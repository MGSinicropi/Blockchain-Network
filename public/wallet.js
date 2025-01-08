import crypto from "crypto";

class Wallet {
    constructor() {
        // Generate a public-private key pair when the wallet is created
        this.keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048, // Strength of the key
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
    }

    /**
     * Get the wallet's unique address
     * The address is derived by hashing the public key
     */
    getAddress() {
        return crypto.createHash("sha256").update(this.keyPair.publicKey).digest("hex");
    }

    /**
     * Get the public key of the wallet
     */
    getPublicKey() {
        return this.keyPair.publicKey;
    }

    /**
     * Get the private key of the wallet
     */
    getPrivateKey() {
        return this.keyPair.privateKey;
    }

    /**
     * Sign a message using the wallet's private key
     * @param {string} message - The message to sign
     * @returns {string} - The digital signature in base64 format
     */
    signMessage(message) {
        const signature = crypto.sign("sha256", Buffer.from(message), {
            key: this.keyPair.privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        });
        return signature.toString("base64");
    }

    /**
     * Verify a signed message using a given public key
     * @param {string} message - The original message
     * @param {string} signature - The digital signature in base64 format
     * @param {string} publicKey - The public key used for verification
     * @returns {boolean} - Whether the signature is valid
     */
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
