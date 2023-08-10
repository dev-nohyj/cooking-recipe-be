import { ApiProperty } from '@nestjs/swagger';

export class CreateS3UrlRes {
    @ApiProperty({
        default: 'https://s3.pregisnedurl',
        description: 'presigned url',
    })
    s3Url: string;
}
