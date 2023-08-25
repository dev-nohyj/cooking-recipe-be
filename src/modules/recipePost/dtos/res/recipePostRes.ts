import { ApiProperty } from '@nestjs/swagger';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { RecipePostCategoryLabel } from 'src/asset/labels/recipePost';

export class GetRecipePostsRes {
    @ApiProperty({
        default: true,
        description: 'hasMore',
    })
    hasMore: boolean;
    @ApiProperty({
        default: [
            {
                id: 1,
                title: '제목',
                thumbnailUrl: 'https://thumbnail.com',
                author: {
                    nickname: 'nickname',
                    profileImageUrl: 'https://profileImageUrl.com',
                },
                isLike: true,
                likeCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                title: '제목',
                thumbnailUrl: 'https://thumbnail.com',
                author: {
                    nickname: 'nickname',
                    profileImageUrl: 'https://profileImageUrl.com',
                },
                isLike: true,
                likeCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        description: '레시피 게시물 리스트',
    })
    recipePostList: {
        id: number;
        title: string;
        thumbnailUrl: string;
        author: { nickname: string; profileImageUrl: string | null };
        isLike: boolean;
        likeCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[];
}

export class GetRecipePostDetailRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    id: number;

    @ApiProperty({
        default: 'https://thumbnail.com',
        description: '썸네일',
    })
    thumbnailUrl: string;

    @ApiProperty({
        default: '제목',
        description: '제목',
    })
    title: string;

    @ApiProperty({
        default: '<div>content</div>',
        description: '내용',
    })
    content: string;

    @ApiProperty({
        default: RecipePostCategoryLabel.Korean,
        description: '카테고리',
    })
    category: RecipePostCategoryLabel;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;

    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;

    @ApiProperty({
        default: {
            id: 'uuid',
            nickname: 'nickname',
            profileImageUrl: null,
        },
        description: '작성자 정보',
    })
    author: {
        id: string;
        nickname: string;
        profileImageUrl: string | null;
    };

    @ApiProperty({
        default: true,
        description: '좋아요 여부',
    })
    isLike: boolean;

    @ApiProperty({
        default: 0,
        description: '좋아요 갯수',
    })
    likeCount: number;

    @ApiProperty({
        default: [
            { id: 1, title: 'hi' },
            { id: 2, title: 'cooking' },
        ],
        description: '태그',
    })
    tags: { id: number; title: string }[];
    @ApiProperty({
        default: 10,
        description: '댓글 갯수',
    })
    commentCount: number;
}

export class CreateRecipePostRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    id: number;

    @ApiProperty({
        default: '제목',
        description: '제목',
    })
    title: string;

    @ApiProperty({
        default: 'https://thumbnail.com',
        description: '썸네일',
    })
    thumbnailUrl: string;

    @ApiProperty({
        default: {
            nickname: 'nickname',
            profileImageUrl: 'https://profileImageUrl.com',
        },
        description: '작성자 정보',
    })
    author: {
        nickname: string;
        profileImageUrl: string | null;
    };

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;
    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;
}

export class DeleteRecipePostRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    recipePostId: number;
}

export class LikeRecipePostRes {
    @ApiProperty({
        default: 1,
        description: 'recipePostId',
    })
    recipePostId: number;

    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    likeType: LikeTypeLabel;
}
