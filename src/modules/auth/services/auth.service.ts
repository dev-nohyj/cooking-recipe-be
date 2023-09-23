import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { arrayNotEmpty, isNotEmptyObject } from 'class-validator';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { LoginFailureLabel } from 'src/asset/labels/loginFailureLabel';
import { CustomSession } from 'express-session';
import { CustomError } from 'src/error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';
import { clearCookieOption } from 'src/config/session';
import { ProviderLabel } from 'src/asset/labels/common';
import axios from 'axios';
import { ModifyProfileArgs, ModifyProfileImageArgs } from '../dtos/args/profileArgs';
import { GetProfileRes, ModifyProfileImageRes, ModifyProfileRes } from '../dtos/res/profileRes';

@Injectable()
export class AuthService {
    constructor(
        // @ts-ignore
        @InjectRedis() private readonly redis: Redis,
        private readonly configService: ConfigService,
        private readonly prismaDatabase: PrismaDatabase,
    ) {}
    async auth(req: Request) {
        const { user } = req;

        if (!user || !isNotEmptyObject(user)) {
            return { url: this.configService.get('CLIENT_URL') + `/loginFailure?code=${LoginFailureLabel.dataEmpty}` };
        }
        if (user.provider === ProviderLabel.kakao && !user.email) {
            const ACCESS_TOKEN = user.accessToken;

            await axios({
                method: 'post',
                url: 'https://kapi.kakao.com/v1/user/unlink',
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            });
            return {
                url: this.configService.get('CLIENT_URL') + `/loginFailure?code=${LoginFailureLabel.kakaoEmptyEmail}`,
            };
        }
        try {
            const existingUser = await this.prismaDatabase.user.findUnique({
                where: { email: user.email },
                select: {
                    id: true,
                    email: true,
                    provider: true,
                },
            });

            if (existingUser) {
                // login
                if (existingUser.provider !== user.provider) {
                    return {
                        url:
                            this.configService.get('CLIENT_URL') +
                            `/loginFailure?code=${LoginFailureLabel.providerFail}`,
                    };
                } else {
                    const keys = await this.redis.keys('sess:*');
                    if (arrayNotEmpty(keys)) {
                        const values = await this.redis.mget(keys);
                        for (let i = 0; i < values.length; i++) {
                            if ((values[i] as any).includes(existingUser.email)) {
                                await this.redis.del(keys[i]);
                                break;
                            }
                        }
                    }

                    req.session.userId = existingUser.id;
                    req.session.email = existingUser.email;
                    req.session.provider = existingUser.provider;
                    req.session.accessToken = user.accessToken;
                    req.session.save();

                    return { url: this.configService.get('CLIENT_URL') + '/loginSuccess?isNewUser=0' };
                }
            } else {
                // signUp
                try {
                    const signUpUser = await this.prismaDatabase.user.create({
                        data: {
                            email: user.email,
                            nickname: user.nickname,
                            provider: user.provider,
                        },
                        select: {
                            id: true,
                            email: true,
                            provider: true,
                        },
                    });

                    req.session.userId = signUpUser.id;
                    req.session.email = signUpUser.email;
                    req.session.provider = signUpUser.provider;
                    req.session.accessToken = user.accessToken;
                    req.session.save();

                    return { url: this.configService.get('CLIENT_URL') + '/loginSuccess?isNewUser=1' };
                } catch (err) {
                    return {
                        url:
                            this.configService.get('CLIENT_URL') + `/loginFailure?code=${LoginFailureLabel.signUpFail}`,
                    };
                }
            }
        } catch (err) {
            return { url: this.configService.get('CLIENT_URL') + `/loginFailure?code=${LoginFailureLabel.dbFail}` };
        }
    }

    async logout(session: CustomSession, res: Response) {
        if (session.provider === ProviderLabel.kakao) {
            const ACCESS_TOKEN = session.accessToken;
            await axios({
                method: 'post',
                url: 'https://kapi.kakao.com/v1/user/logout',
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            });
        }
        session.destroy((err) => {
            if (err) {
                throw new CustomError({ customError: customErrorLabel.SYSTEM_ERROR.customError });
            }
        });
        res.clearCookie(this.configService.get('SESSION_KEY') as string, clearCookieOption(this.configService));

        return true;
    }

    async deleteUser(session: CustomSession, res: Response) {
        try {
            const user = await this.prismaDatabase.user.findUnique({
                where: { id: session.userId },
            });

            if (!user) {
                throw new CustomError({ customError: customErrorLabel.SYSTEM_ERROR.customError });
            }

            await this.prismaDatabase.user.delete({ where: { id: session.userId } });

            if (session.provider === ProviderLabel.kakao) {
                const ACCESS_TOKEN = session.accessToken;

                await axios({
                    method: 'post',
                    url: 'https://kapi.kakao.com/v1/user/unlink',
                    headers: {
                        Authorization: `Bearer ${ACCESS_TOKEN}`,
                    },
                });
            }
            session.destroy((err) => {
                if (err) {
                    throw new CustomError({ customError: customErrorLabel.SYSTEM_ERROR.customError });
                }
            });
            res.clearCookie(this.configService.get('SESSION_KEY') as string, clearCookieOption(this.configService));
            return true;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.SYSTEM_ERROR.customError });
        }
    }

    async modifyProfile(modifyProfileArgs: ModifyProfileArgs, session: CustomSession): Promise<ModifyProfileRes> {
        const { nickname, introduction } = modifyProfileArgs;
        const user = await this.prismaDatabase.user.findUnique({ where: { id: session.userId } });

        if (!user) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_USER.customError });
        }
        try {
            const updateUser = await this.prismaDatabase.user.update({
                where: { id: session.userId },
                data: {
                    nickname,
                    introduction,
                },
                select: {
                    nickname: true,
                    introduction: true,
                },
            });
            return updateUser;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.MODIFY_USER_FAILURE.customError });
        }
    }

    async modifyProfileImage(
        modifyProfileImageArgs: ModifyProfileImageArgs,
        session: CustomSession,
    ): Promise<ModifyProfileImageRes> {
        const { profileImageUrl } = modifyProfileImageArgs;
        const user = await this.prismaDatabase.user.findUnique({ where: { id: session.userId } });

        if (!user) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_USER.customError });
        }
        try {
            const updateUser = await this.prismaDatabase.user.update({
                where: { id: session.userId },
                data: {
                    profileImageUrl,
                },
                select: {
                    profileImageUrl: true,
                },
            });
            return updateUser;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.MODIFY_USER_FAILURE.customError });
        }
    }

    async getProfile(userId: string | undefined): Promise<GetProfileRes> {
        if (!userId) return { profile: null };
        try {
            const user = await this.prismaDatabase.user.findFirstOrThrow({ where: { id: userId } });
            return { profile: user };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_USER.customError });
        }
    }
}
