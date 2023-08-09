import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './prisma/database.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
    imports: [
        // configuration module
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule.forRoot({
            config: {
                url: process.env.REDIS_URL,
                retryStrategy: (times: number) => Math.max(times * 100, 3000),
            },
        }),
        // db
        DatabaseModule,
    ],
})
export class AppModule {}
