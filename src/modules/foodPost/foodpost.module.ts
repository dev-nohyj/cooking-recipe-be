import { Module } from '@nestjs/common';
import { FoodPostController } from './foodpost.controller';
import { FoodPostService } from './foodpost.service';

@Module({
    controllers: [FoodPostController],
    providers: [FoodPostService],
})
export class FoodPostModule {}
