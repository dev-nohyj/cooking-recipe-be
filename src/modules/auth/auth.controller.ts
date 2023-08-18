import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Post,
    Put,
    Redirect,
    Req,
    Res,
    Session,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { NoAuth } from 'src/decorators/noAuth.decorators';
import { SwaggerReply } from 'src/decorators/swaggerReply.decorators';

import { ApiTags } from '@nestjs/swagger';
import { ApiTagLabel } from 'src/asset/labels/common';
import { AuthService } from './services/auth.service';
import { CustomSession } from 'express-session';
import { ModifyProfileRes } from './dtos/res/modifyProfileRes';
import { ModifyProfileArgs } from './dtos/args/modifyProfileArgs';
import { GetProfileRes } from './dtos/res/getProfileRes';

@ApiTags(ApiTagLabel.auth)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @NoAuth()
    @SwaggerReply({
        summary: '구글 로그인',
    })
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {
        return HttpStatus.OK;
    }

    @NoAuth()
    @SwaggerReply({
        summary: '구글 로그인 콜백',
    })
    @Redirect()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleCallback(@Req() req: Request) {
        return this.authService.auth(req);
    }

    @NoAuth()
    @SwaggerReply({
        summary: '카카오 로그인',
    })
    @Get('kakao')
    @UseGuards(AuthGuard('kakao'))
    kakaoLogin() {
        return HttpStatus.OK;
    }

    @NoAuth()
    @SwaggerReply({
        summary: '카카오 로그인 콜백',
    })
    @Redirect()
    @Get('kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    kakaoCallback(@Req() req: Request) {
        return this.authService.auth(req);
    }

    @SwaggerReply({
        summary: '로그아웃',
    })
    @Post('logout')
    logout(@Session() session: CustomSession, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(session, res);
    }

    @SwaggerReply({
        summary: '회원 탈퇴',
    })
    @Delete('deleteUser')
    deleteUser(@Session() session: CustomSession, @Res({ passthrough: true }) res: Response) {
        return this.authService.deleteUser(session, res);
    }

    @SwaggerReply({
        summary: '유저 정보 수정',
        type: ModifyProfileRes,
    })
    @Put('modifyProfile')
    modifyProfile(@Body() modifyProfileArgs: ModifyProfileArgs, @Session() session: CustomSession) {
        return this.authService.modifyProfile(modifyProfileArgs, session);
    }

    @SwaggerReply({
        summary: '유저 정보 조회',
        type: GetProfileRes,
    })
    @Get('profile')
    info(@Session() session: CustomSession) {
        return this.authService.getProfile(session.userId);
    }
}
