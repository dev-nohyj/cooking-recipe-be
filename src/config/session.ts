import { ConfigService } from '@nestjs/config';
import { SessionOptions } from 'express-session';
import { redis } from './redis';
import { CookieOptions } from 'express';
import RedisStore from 'connect-redis';

// redis session
export function sessionOptions(configService: ConfigService): SessionOptions {
    return {
        secret: configService.get('SESSION_SECRET') as string,
        name: configService.get('SESSION_KEY'),

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
            sameSite: 'lax',
            secure: configService.get('NODE_ENV') === 'production',
            domain: configService.get('NODE_ENV') === 'production' ? configService.get('SESSION_DOMAIN') : 'localhost',
        },
        store: new RedisStore({
            client: redis(configService),
            ttl: 60 * 60 * 24 * 30, // 1 month
            disableTouch: false,
        }),
        proxy: configService.get('NODE_ENV') === 'production' ? true : undefined,
        resave: false,
        saveUninitialized: false,
    };
}

export const clearCookieOption = (configService: ConfigService): CookieOptions => {
    return {
        domain: process.env.NODE_ENV === 'production' ? configService.get('SESSION_DOMAIN') : 'localhost',
        maxAge: -1,
    };
};
