import { Global, Module } from '@nestjs/common';
import { PrismaDatabase } from './prisma.service';

@Global()
@Module({
    providers: [PrismaDatabase],
    exports: [PrismaDatabase],
})
export class DatabaseModule {}
