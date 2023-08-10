import { Module } from '@nestjs/common';
import { Awss3Controller } from './awss3.controller';
import { Awss3Service } from './awss3.service';

@Module({
    imports: [],
    controllers: [Awss3Controller],
    providers: [Awss3Service],
})
export class AwsModule {}
