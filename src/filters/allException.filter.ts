import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { CustomError } from '../error/custom.error';
import { customErrorLabel } from 'src/const/labels/error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private prismaDatabase: PrismaDatabase, private configService: ConfigService) {}

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        try {
            const { body, method, params, query } = req;

            if (
                this.configService.get('NODE_ENV') === 'dev' &&
                exception?.response?.statusCode !== HttpStatus.NOT_FOUND
            ) {
                console.error('Error:: ', JSON.stringify(exception, null, 2).replace(/\n\r?/g, '\n\t'));
            }

            const errorCode =
                exception instanceof CustomError && exception?.reason && exception?.reason?.customError
                    ? customErrorLabel[exception.reason.customError as keyof typeof customErrorLabel].code
                    : exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            const data = {
                method: method,
                url: req.originalUrl,
                errorCode: errorCode,
                errorMessage:
                    customErrorLabel[exception?.reason?.customError as keyof typeof customErrorLabel]?.clientMsg ??
                    'An error occurred on the server.',
                controller: exception.locationName?.controller ?? null,
                handler: exception.locationName?.handler ?? null,
                userId: req.session?.userId ? req.session.userId : null,
                request: JSON.stringify(body ? body : Object.keys(params).length ? params : query),
                reason: JSON.stringify(exception?.reason) ?? null,
            };

            if (exception instanceof CustomError && exception.reason?.customError) {
                await this.prismaDatabase.errorLog.create({ data });
            } else {
                if (exception.status === HttpStatus.NOT_FOUND) {
                    data.errorMessage = customErrorLabel.NOTFOUND.clientMsg;
                    data.errorCode = customErrorLabel.NOTFOUND.code;
                } else if (exception?.code === 'P2025' || exception?.code === 'P2000') {
                    data.errorMessage = customErrorLabel.PRISMA_ERROR.clientMsg + `[code]: ${exception?.code}`;
                    data.errorCode = customErrorLabel.PRISMA_ERROR.code;
                } else if (exception?.code === 'NoSuchKey') {
                    data.errorMessage = customErrorLabel.S3_ERROR.clientMsg;
                    data.errorCode = customErrorLabel.S3_ERROR.code;
                }

                if (exception.status !== HttpStatus.NOT_FOUND) {
                    await this.prismaDatabase.errorLog.create({ data });
                }
            }

            res.status(400).json({
                customErrorCode: data.errorCode,
                message: data.errorMessage ?? 'An error occurred on the server.',
            });
        } catch (err: any) {
            res.status(400).json({
                customErrorCode: customErrorLabel.UNKNOWN.code,
                message: customErrorLabel.UNKNOWN.clientMsg,
            });
            if (this.configService.get('NODE_ENV') === 'dev') {
                console.log(`🆘 all Exception Filter error : ${err}`);
            }
        }
    }
}
