import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Awss3Service } from './awss3.service';
import { CreateS3UrlRes } from './dtos/createS3UrlRes';
import { ApiTagLabel } from 'src/asset/labels/common';
import { SwaggerReply } from 'src/decorators/swaggerReply.decorators';
import { CreateS3UrlArgs } from './dtos/createS3UrlArgs';

@ApiTags(ApiTagLabel.awsS3)
@Controller('awsS3')
export class Awss3Controller {
    constructor(private readonly awss3Service: Awss3Service) {}

    @SwaggerReply({
        summary: 'presignedUrl 생성',
        type: CreateS3UrlRes,
    })
    @Post('createS3Url')
    createS3Url(@Body() createS3UrlArgs: CreateS3UrlArgs) {
        return this.awss3Service.createS3Url(createS3UrlArgs);
    }
}
