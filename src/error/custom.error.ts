export class CustomError extends Error {
    constructor(
        public reason: { customError?: string; value?: any },
        public ctx?: { controller: string; handler: string },
    ) {
        super();
    }
}
