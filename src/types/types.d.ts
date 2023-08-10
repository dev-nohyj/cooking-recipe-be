import { ProviderLabel } from 'src/asset/labels/common';

declare module 'express-session' {
    interface SessionData {
        userId: string;
        email: string;
        provider: ProviderLabel;
        accessToken: string;
    }
    interface CustomSession extends Session, SessionData {}
}

declare global {
    namespace Express {
        interface User {
            email: string;
            nickname: string;
            provider: ProviderLabel;
            accessToken: string;
        }
        export interface Request {
            user?: {
                email: string;
                nickname: string;
                provider: ProviderLabel;
                accessToken: string;
            };
            clientIp?: string;
        }
    }
}

export {};
