import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { customErrorLabel } from 'src/asset/labels/error';
import { CustomError } from 'src/error/custom.error';
import { FoodPostIdArgs } from './commonArgs';
import { LikeTypeLabel } from 'src/asset/labels/common';

export class CreateFoodPostArgs {
    @ApiProperty({
        default: '내용',
        description: '내용',
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 300)
    @ValidateIf((_, value) => value !== null)
    description: string | null;

    @ApiProperty({
        default: ['한식', '쉬운 난이도'],
        description: '해시 태그 (최대 20개), nullable',
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((_, value: string[] | null) => {
        if (value && value.length === 0) {
            throw new CustomError({ customError: customErrorLabel.INVALID_DATA_TYPE.customError });
        }
        if (value && value.length > 20) {
            throw new CustomError({ customError: customErrorLabel.RECIPE_POST_MAX_TAG.customError });
        }

        return value !== null;
    })
    tags: string[] | null;

    @ApiProperty({
        default: [
            { id: undefined, url: 'https://www.naverImage.com/image.png' },
            { id: 1, url: 'https://www.naverImage.com/image2.png' },
        ],
        description: '이미지 url(최대 6개) 추가는 id undefined',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FoodImages)
    @ValidateIf((_, value: { id?: number; url: string }[]) => {
        if (value === null) {
            throw new CustomError({ customError: customErrorLabel.INVALID_DATA_TYPE.customError });
        }
        if (value && value.length === 0) {
            throw new CustomError({ customError: customErrorLabel.INVALID_DATA_TYPE.customError });
        }
        if (value && value.length > 6) {
            throw new CustomError({ customError: customErrorLabel.MAX_FOOD_POST_IMAGES.customError });
        }

        return !!value;
    })
    foodImages: FoodImages[];
}
class FoodImages {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id: number | undefined;

    @IsString()
    @IsNotEmpty()
    url: string;
}

export class GetFoodPostsArgs {
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
}

export class LikeFoodPostArgs extends FoodPostIdArgs {
    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    @IsEnum(LikeTypeLabel)
    likeType: LikeTypeLabel;
}

export class ModifyFoodPostArgs extends CreateFoodPostArgs {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    foodPostId: number;
}
