import { ApiProperty } from '@nestjs/swagger';
import { CreateRecipePostArgs } from './createRecipePostArgs';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ModifyRecipePostArgs extends CreateRecipePostArgs {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    recipePostId: number;
}
