import { ApiProperty } from '@nestjs/swagger';
import { LikeTypeLabel } from 'src/asset/labels/common';

export class DeleteFoodPostRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    foodPostId: number;
}

export class LikeFoodPostRes {
    @ApiProperty({
        default: 1,
        description: 'foodPostId',
    })
    foodPostId: number;

    @ApiProperty({
        default: LikeTypeLabel.like,
        description: 'like type',
    })
    likeType: LikeTypeLabel;
}

export class GetFoodPostsRes {
    @ApiProperty({
        default: true,
        description: 'hasMore',
    })
    hasMore: boolean;

    @ApiProperty({
        default: [
            {
                id: 1,
                description: '내용',
                author: { nickname: 'hi', profileImageUrl: 'https://profileImage.com' },
                imageUrl: 'https://www.imageUrl',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                description: '내용',
                author: { nickname: 'hi', profileImageUrl: 'https://profileImage.com' },
                imageUrl: 'https://www.imageUrl',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
    })
    foodPostList: {
        id: number;
        description: string | null;
        author: { nickname: string; profileImageUrl: string | null };
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
}

export class GetFoodPostDetailRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    id: number;
    @ApiProperty({
        default: '내용',
        description: '내용',
    })
    description: string | null;
    @ApiProperty({
        default: { id: 'uuid', nickname: 'nickname', profileImageUrl: 'https://profilImageUrl', introduction: 'hi' },
        description: 'author info',
    })
    author: {
        id: string;
        nickname: string;
        profileImageUrl: string | null;
        introduction: string | null;
    };
    @ApiProperty({
        default: [
            { id: 1, url: 'https://foodImageUrl1' },
            { id: 2, url: 'https://foodImageUrl2' },
        ],
        description: 'food Images',
    })
    foodImages: { id: number; url: string }[];
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
            { id: 2, title: 'hello' },
        ],
        description: '태그',
    })
    tags: { id: number; title: string }[];

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;
    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;
}

export class CreateFoodPostRes {
    @ApiProperty({
        default: 1,
        description: 'id',
    })
    id: number;

    @ApiProperty({
        default: '내용',
        description: '내용',
    })
    description: string | null;

    @ApiProperty({
        default: { nickname: 'nickname', profileImageUrl: 'https://profilImageUrl' },
        description: 'author info',
    })
    author: {
        nickname: string;
        profileImageUrl: string | null;
    };

    @ApiProperty({
        default: 'https://foodImage',
        description: 'foodImage',
    })
    imageUrl: string;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;
    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;
}
