import { ApiProperty } from '@nestjs/swagger';
import { RecipePostIdArgs } from './commonArgs';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CommentIdArgs {
    @ApiProperty({
        default: 1,
        description: 'commentId',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    commentId: number;
}

export class CreateRecipeCommentArgs extends RecipePostIdArgs {
    @ApiProperty({
        default: '댓글 내용',
        description: '댓글 내용',
    })
    @IsNotEmpty()
    @Length(1, 300)
    @IsString()
    comment: string;

    @ApiProperty({
        default: null,
        description: '댓글 그룹 id',
    })
    @IsNumber()
    @ValidateIf((_, value) => value !== null)
    @IsNotEmpty()
    @Type(() => Number)
    parentId: number | null;
}

export class ModifyRecipeCommentArgs extends CommentIdArgs {
    @ApiProperty({
        default: '댓글 수정 내용',
        description: '댓글 수정 내용',
    })
    @IsNotEmpty()
    @Length(1, 300)
    @IsString()
    comment: string;
}

export class GetRecipeCommentListArgs extends RecipePostIdArgs {
    @ApiProperty({
        default: 20,
        description: 'size',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    size: number;

    @ApiProperty({
        default: undefined,
        description: '댓글 그룹 id',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    parentId: number;

    @ApiProperty({
        default: undefined,
        description: 'cursor (comment lastId)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    cursor: number;
}
