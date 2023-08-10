import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PresignedUrlTypeLabel } from 'src/asset/labels/common';

export class CreateS3UrlArgs {
    @ApiProperty({
        default: PresignedUrlTypeLabel.userProfile,
        description: 'presigned url 타입',
    })
    @IsNotEmpty()
    @IsEnum(PresignedUrlTypeLabel)
    urlType: PresignedUrlTypeLabel;

    @ApiProperty({
        default: 'image/jpeg',
        description: 'contentType',
    })
    @IsNotEmpty()
    @IsString()
    contentType: string;
}
