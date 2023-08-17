import { ApiProperty } from '@nestjs/swagger';
import { FoodPostIdArgs } from './commonArgs';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { IsEnum } from 'class-validator';

export class LikeFoodPostArgs extends FoodPostIdArgs {
    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    @IsEnum(LikeTypeLabel)
    likeType: LikeTypeLabel;
}
