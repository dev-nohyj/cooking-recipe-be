import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { arrayNotEmpty, isNotEmptyObject } from 'class-validator';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CustomError } from '../error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';

@Injectable()
export class CheckInvalidDataTypeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const { body, params, query } = context.switchToHttp().getRequest<Request>();

        const checkEmptyDataHandler = (requestData: any) => {
            return (
                isNotEmptyObject(requestData, { nullable: true }) &&
                arrayNotEmpty(
                    Object.values(requestData).filter((data) => typeof data === 'string' && data.trim() === ''),
                )
            );
        };

        if (checkEmptyDataHandler(body) || checkEmptyDataHandler(query) || checkEmptyDataHandler(params)) {
            throw new CustomError(
                { customError: customErrorLabel.INVALID_DATA_TYPE.customError },
                {
                    controller: context.getClass().name,
                    handler: context.getHandler().name,
                },
            );
        }

        return next.handle();
    }
}
