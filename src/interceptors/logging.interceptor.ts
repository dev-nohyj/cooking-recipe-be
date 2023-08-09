import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Logger } from 'src/config/logger';
import { CustomError } from '../error/custom.error';
import { customErrorLabel } from 'src/const/labels/error';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const { body, method, originalUrl, params, query, session, clientIp } = context
            .switchToHttp()
            .getRequest<Request>();
        const now = Date.now();

        // @ts-ignore
        BigInt.prototype['toJSON'] = function () {
            return parseInt(this.toString());
        };

        return next.handle().pipe(
            map((data) => {
                if (body?.password) {
                    delete body.password;
                }
                if (body?.oldPassword) {
                    delete body.oldPassword;
                }
                if (body?.newPassword) {
                    delete body.newPassword;
                }
                try {
                    Logger.http(
                        `🚀 method:: [ ${method} ] request:: [ ${JSON.stringify(
                            body ? body : Object.keys(params).length ? params : query,
                        )} ]  elapsed:: [ ${Date.now() - now} ] url:: [ ${originalUrl}  userID:: [${
                            session.userId ? session.userId : null
                        }] ip:: [${clientIp}] controller:: [${context.getClass().name}] handler:: [${
                            context.getHandler().name
                        }] `,
                    );
                } catch (err) {
                    throw new CustomError(
                        { customError: customErrorLabel.LOGGING_ERROR.customError, value: err },
                        { controller: context.getClass().name, handler: context.getHandler().name },
                    );
                }

                return data;
            }),
            catchError((err) => {
                if (err instanceof CustomError) {
                    throw new CustomError(err.reason, {
                        controller: context.getClass().name,
                        handler: context.getHandler().name,
                    });
                } else if (err instanceof BadRequestException) {
                    throw new CustomError(
                        { customError: customErrorLabel.BAD_REQUEST.customError, value: err.getResponse() },
                        {
                            controller: context.getClass().name,
                            handler: context.getHandler().name,
                        },
                    );
                } else {
                    throw new CustomError(
                        { customError: customErrorLabel.BAD_REQUEST.customError, value: err },
                        {
                            controller: context.getClass().name,
                            handler: context.getHandler().name,
                        },
                    );
                }
            }),
        );
    }
}
