import { ApiProperty } from '@nestjs/swagger';

export class LikeRecipePostRes {
    @ApiProperty({
        default: 'asd-gre-asdf',
        description: 'userId',
    })
    userId: string;

    @ApiProperty({
        default: 1,
        description: 'recipePostId',
    })
    recipePostId: number;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;
}
