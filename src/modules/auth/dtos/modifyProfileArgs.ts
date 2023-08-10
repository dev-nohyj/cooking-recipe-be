import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';

export class ModifyProfileArgs {
    @ApiProperty({
        default: 'Food Good',
        description: '닉네임',
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 20)
    nickname: string;

    @ApiProperty({
        default: 'https://s3image.com',
        description: '프로필 사진 이미지 url',
        nullable: true,
    })
    @IsString()
    @ValidateIf((_, value) => value !== null)
    profileImageUrl: string | null;

    @ApiProperty({
        default: '반갑습니다 :)',
        description: '한줄 자기 소개',
        nullable: true,
    })
    @IsString()
    @ValidateIf((_, value) => value !== null)
    @Length(1, 100)
    introduction: string | null;
}
