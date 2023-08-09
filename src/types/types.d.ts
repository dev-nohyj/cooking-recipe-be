declare module 'express-session' {
    interface SessionData {
        userId: string;
        email: string;
        accessToken?: string;
    }
    interface CustomSession extends Session, SessionData {}
}

declare global {
    namespace Express {
        interface User {
            email: string;
            nickname: string;
            accessToken?: string;
        }
        export interface Request {
            user?: {
                email: string;
                nickname: string;
                accessToken?: string;
            };
            clientIp?: string;
        }
    }
}

export {};
