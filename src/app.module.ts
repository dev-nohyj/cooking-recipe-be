import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './prisma/database.module';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AwsModule } from './aws/aws.module';
import { RecipePostModule } from './modules/recipePost/recipepost.module';

@Module({
    imports: [
        RecipePostModule,
        AuthModule,
        AwsModule,
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
