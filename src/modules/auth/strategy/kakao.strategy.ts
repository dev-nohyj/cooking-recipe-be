import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ProviderLabel } from 'src/asset/labels/common';

export class KakaoStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.KAKAO_ID,
            callbackURL: process.env.KAKAO_CALLBACK_URL,
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
        const nickname: string = profile._json.kakao_account.profile?.nickname;
        const payload = {
            email: profile._json.kakao_account.email as string,
            nickname: nickname.length > 20 ? nickname.substring(0, 20) : nickname,
            provider: ProviderLabel.kakao,
            accessToken,
        };

        done(null, payload);
    }
}
