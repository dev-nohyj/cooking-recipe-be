import { Request, Response } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { clearCookieOption } from 'src/config/session';
import { CustomError } from '../error/custom.error';
import { MetadataKey } from '../const/labels/common';
import { customErrorLabel } from 'src/const/labels/error';

/**
 * 데코레이터를 달아두면 권한 없이 모두가 사용
 * 그 외에는 로그인 여부 체크 후 사용 또는 에러
 */

@Injectable()
export class UserAuthGuard implements CanActivate {
    constructor(private reflector: Reflector, private readonly configService: ConfigService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const { session, headers } = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        if (
            !session.userId &&
            headers.cookie &&
            headers.cookie.includes(this.configService.get('SESSION_KEY') as string)
        ) {
            res.clearCookie(this.configService.get('SESSION_KEY') as string, clearCookieOption(this.configService));
        }
        const NoAuth = this.reflector.get<boolean>(MetadataKey.NoAuth, context.getHandler());

        if (NoAuth) {
            // 데코레이팅을 한경우 @NoAuth()
            return true;
        } else {
            // 데코레이팅을 안한 경우
            if (session.userId) {
                return true;
            }
            throw new CustomError(
                { customError: customErrorLabel.NO_EXISTING_SESSION.customError },
                {
                    controller: context.getClass().name,
                    handler: context.getHandler().name,
                },
            );
        }
    }
}
