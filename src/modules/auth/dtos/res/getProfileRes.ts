import { ApiProperty } from '@nestjs/swagger';
import { ProviderLabel } from 'src/asset/labels/common';

export class GetProfileRes {
    @ApiProperty({
        default: {
            id: 'uuid(aaaa-1111-2333-fpwea12aa-42fer)',
            email: 'aaa@gmail.com',
            nickname: 'Food Good',
            provider: ProviderLabel.google,
            profileImageUrl: 'https://s3image.com',
            introduction: '반갑습니다 :)',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        description: 'user info',
    })
    profile: {
        id: string;
        email: string;
        nickname: string;
        provider: ProviderLabel;
        profileImageUrl: string | null;
        introduction: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
}
