import { Module } from '@nestjs/common';
import { RecipePostController } from './recipepost.controller';
import { RecipePostService } from './recipepost.service';

@Module({
    controllers: [RecipePostController],
    providers: [RecipePostService],
})
export class RecipePostModule {}
