import { ApiProperty } from '@nestjs/swagger';
import { ProviderLabel } from 'src/asset/labels/common';

export class GetProfileRes {
    @ApiProperty({
        default: 'uuid(aaaa-1111-2333-fpwea12aa-42fer)',
        description: 'userId',
    })
    id: string;

    @ApiProperty({
        default: 'aaa@gmail.com',
        description: '이메일',
    })
    email: string;

    @ApiProperty({
        default: 'Food Good',
        description: '닉네임',
    })
    nickname: string;

    @ApiProperty({
        default: ProviderLabel.google,
        description: '소셜 로그인 유형',
    })
    provider: ProviderLabel;

    @ApiProperty({
        default: 'https://s3image.com',
        description: '프로필 사진 이미지 url',
        nullable: true,
    })
    profileImageUrl: string | null;

    @ApiProperty({
        default: '반갑습니다 :)',
        description: '한줄 자기 소개',
        nullable: true,
    })
    introduction: string | null;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;

    @ApiProperty({
        description: '수정일',
    })
    updatedAt: Date;
}
