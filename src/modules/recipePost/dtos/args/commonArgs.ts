import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RecipePostIdArgs {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    recipePostId: number;
}
