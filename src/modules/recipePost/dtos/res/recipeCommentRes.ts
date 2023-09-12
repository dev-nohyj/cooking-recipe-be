import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipePostCommentRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    id: number;

    @ApiProperty({
        default: '댓글 내용',
        description: '댓글 내용',
    })
    comment: string;

    @ApiProperty({
        default: { id: 'uuid', profileImageUrl: 'https://profileImageUrl', nickname: 'nickname' },
        description: '작성자 정보',
    })
    writer: { id: string; profileImageUrl: string | null; nickname: string } | null;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;

    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;

    @ApiProperty({
        default: null,
        description: '삭제일',
    })
    deletedAt: Date | null;
}

export class DeleteRecipePostCommentRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    commentId: number;

    @ApiProperty({
        description: '삭제일',
    })
    deletedAt: Date;
}

export class GetRecipePostCommentRes {
    @ApiProperty({
        default: true,
        description: 'hasMore',
    })
    hasMore: boolean;

    @ApiProperty({
        default: [
            {
                id: 1,
                comment: '댓글 내용',
                writer: { id: 'uuid', profileImageUrl: 'https://profileImageUrl', nickname: 'nickname' },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
            {
                id: 2,
                comment: '댓글 내용',
                writer: { id: 'uuid', profileImageUrl: 'https://profileImageUrl', nickname: 'nickname' },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
        ],
        description: '댓글 리스트',
    })
    commentList: {
        id: number;
        comment: string;
        writer: { id: string; profileImageUrl: string | null; nickname: string } | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[];
}

export class ModifyRecipePostCommentRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    commentId: number;

    @ApiProperty({
        default: '내용',
        description: '변경 내용',
    })
    comment: string;

    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;
}
