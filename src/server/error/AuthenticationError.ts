export default class AuthenticationError extends Error {
    public httpStatusCode: number = 401;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}