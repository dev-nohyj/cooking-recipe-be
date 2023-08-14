import { ApiProperty } from '@nestjs/swagger';

export class DeleteRecipePostRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    recipePostId: number;
}
