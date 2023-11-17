class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);  // Pass the message to the super class
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;