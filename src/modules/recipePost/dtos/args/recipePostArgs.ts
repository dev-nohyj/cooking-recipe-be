import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateIf } from 'class-validator';
import { customErrorLabel } from 'src/asset/labels/error';
import { RecipePostCategoryLabel } from 'src/asset/labels/recipePost';
import { CustomError } from 'src/error/custom.error';
import { RecipePostIdArgs } from './commonArgs';
import { LikeTypeLabel } from 'src/asset/labels/common';

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

export class CreateRecipePostArgs {
    @ApiProperty({
        default: '제목',
        description: '제목',
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    title: string;

    @ApiProperty({
        default: '<div>html tags</div>',
        description: '컨텐츠',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        default: 'https://www.naverImage.com/image.png',
        description: '썸네일 이미지',
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 300)
    thumbnailUrl: string;

    @ApiProperty({
        default: RecipePostCategoryLabel.Etc,
        description: '카테고리',
    })
    @Type(() => Number)
    @IsEnum(RecipePostCategoryLabel)
    category: RecipePostCategoryLabel;

    @ApiProperty({
        default: ['한식', '쉬운 난이도'],
        description: '해시 태그 (최대 5개), nullable',
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((_, value: string[] | null) => {
        if (value && value.length === 0) {
            throw new CustomError({ customError: customErrorLabel.INVALID_DATA_TYPE.customError });
        }
        if (value && value.length > 5) {
            throw new CustomError({ customError: customErrorLabel.RECIPE_POST_MAX_TAG.customError });
        }

        return value !== null;
    })
    tags: string[] | null;
}

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

export class LikeRecipePostArgs extends RecipePostIdArgs {
    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    @IsEnum(LikeTypeLabel)
    likeType: LikeTypeLabel;
}
