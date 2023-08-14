import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { RecipePostCategoryLabel } from 'src/asset/labels/recipePost';

export class GetRecipePostsArgs {
    @ApiProperty({
        default: 20,
        description: 'size',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    size: number;

    @ApiProperty({
        description: 'cursor (post lastId)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    @Type(() => Number)
    cursor: number;

    @ApiProperty({
        description: '카테고리',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsEnum(RecipePostCategoryLabel)
    category: RecipePostCategoryLabel;
}
