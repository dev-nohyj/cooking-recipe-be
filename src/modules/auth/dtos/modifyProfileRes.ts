import { ApiProperty } from '@nestjs/swagger';

export class ModifyProfileRes {
    @ApiProperty({
        default: 'Food Good',
        description: '닉네임',
    })
    nickname: string;

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
}
