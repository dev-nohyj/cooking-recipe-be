import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { AutoGenerateTimeMiddleware } from './middlewares/autoGenerateTime.middleware';
import { SoftDeleteMiddlware } from './middlewares/softDelete.middleware';
import { TimezoneMiddlware } from './middlewares/timezone.middleware';

@Injectable()
export class PrismaDatabase extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
        });
    }
    async onModuleInit() {
        await this.$connect();
        this.$use((params, next) => SoftDeleteMiddlware(params, next, Prisma));
        this.$use((params, next) => AutoGenerateTimeMiddleware(params, next, Prisma));
        this.$use((params, next) => TimezoneMiddlware(params, next));
    }
    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}
