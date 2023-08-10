import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ProviderLabel } from 'src/asset/labels/common';

export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
        const { _json } = profile;
        const payload = {
            email: _json.email,
            nickname: _json.name?.length! > 20 ? _json.name?.substring(0, 20) : _json.name,
            provider: ProviderLabel.google,
            accessToken,
        };

        done(null, payload);
    }
}
