import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateS3UrlArgs } from './dtos/createS3UrlArgs';
import AWS from 'aws-sdk';
import { customErrorLabel } from 'src/asset/labels/error';
import { CustomError } from 'src/error/custom.error';
import { presignedUrlFilePath } from 'src/utils/presignedUrlFilePath';

@Injectable()
export class Awss3Service {
    private readonly S3: AWS.S3;
    constructor(private readonly configService: ConfigService) {
        this.S3 = new AWS.S3({
            credentials: {
                accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID') as string,
                secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY') as string,
            },
            region: this.configService.get('AWS_REGION') as string,
        });
    }

    async createS3Url(createS3UrlArgs: CreateS3UrlArgs) {
        const { urlType, contentType } = createS3UrlArgs;
        const filePath = presignedUrlFilePath(urlType);
        const ext = contentType.split('/')[1];
        const fileName = `foodShard-file-${Date.now()}.${ext}`;

        const params = {
            Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
            Key: filePath + fileName,
            ContentType: contentType, // 'image/jpeg'
            Expires: 600, // 10분
        };
        try {
            const s3Url = await this.S3.getSignedUrlPromise('putObject', params);
            return { s3Url };
        } catch (err) {
            if (err) {
                throw new CustomError({ customError: customErrorLabel.S3_ERROR.customError });
            }
        }
    }
}
