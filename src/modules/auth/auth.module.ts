import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { AuthService } from './services/auth.service';

@Module({
    controllers: [AuthController],
    providers: [GoogleStrategy, KakaoStrategy, AuthService],
})
export class AuthModule {}
