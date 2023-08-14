import { ApiProperty } from '@nestjs/swagger';
import { RecipePostIdArgs } from './commonArgs';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { IsEnum } from 'class-validator';

export class LikeRecipePostArgs extends RecipePostIdArgs {
    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    @IsEnum(LikeTypeLabel)
    likeType: LikeTypeLabel;
}
