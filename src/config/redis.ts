import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const redis = (configService: ConfigService) => {
    return new Redis({
        port: parseInt(configService.get('REDIS_PORT') as string),
        host: configService.get('REDIS_HOST'),
        retryStrategy: (times: number) => Math.max(times * 100, 3000),
    });
};
