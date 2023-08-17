import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { customErrorLabel } from 'src/asset/labels/error';
import { CustomError } from 'src/error/custom.error';

export class ModifyFoodPostArgs {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    foodPostId: number;

    @ApiProperty({
        default: 'https://www.naverImage.com/image.png',
        description: '메인 이미지',
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 300)
    mainImageUrl: string;

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
            { id: 1, url: 'https://www.naverImage.com/image.png' },
            { url: 'https://www.naverImage.com/image2.png' },
        ],
        description: '이미지 url(최대 6개), nullable',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OtherImage)
    @ValidateIf((_, value: OtherImage[] | null) => {
        if (value && value.length === 0) {
            throw new CustomError({ customError: customErrorLabel.INVALID_DATA_TYPE.customError });
        }
        if (value && value.length > 6) {
            throw new CustomError({ customError: customErrorLabel.RECIPE_POST_MAX_TAG.customError });
        }

        return value !== null;
    })
    otherImages: OtherImage[] | null;
}

class OtherImage {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id: number | undefined;

    @IsString()
    @IsNotEmpty()
    url: string;
}
