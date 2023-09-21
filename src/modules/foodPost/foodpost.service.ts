import { Injectable } from '@nestjs/common';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { CustomError } from 'src/error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';

import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { redisPrefix } from 'src/asset/prefix';
import { CreateFoodPostArgs, GetFoodPostsArgs, LikeFoodPostArgs, ModifyFoodPostArgs } from './dtos/args/foodPostArgs';
import {
    CreateFoodPostRes,
    DeleteFoodPostRes,
    GetFoodPostDetailRes,
    GetFoodPostsRes,
    GetPopularFoodPostsRes,
    LikeFoodPostRes,
} from './dtos/res/foodPostRes';

@Injectable()
export class FoodPostService {
    // @ts-ignore
    constructor(private readonly prismaDatabase: PrismaDatabase, @InjectRedis() private readonly redis: Redis) {}

    async getDetailFoodPost(
        foodPostId: number,
        clientIp: string | undefined,
        userId: string | undefined,
    ): Promise<GetFoodPostDetailRes> {
        const existingPost = await this.prismaDatabase.foodPost.findUnique({
            where: { id: foodPostId },
            select: {
                id: true,
                description: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImageUrl: true,
                        introduction: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
                viewCount: true,
                foodPostImages: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
                foodPostLikeUserRelation: {
                    where: { userId },
                },
                _count: {
                    select: {
                        foodPostLikeUserRelation: true,
                    },
                },
                foodPostTagReltaion: {
                    select: {
                        foodPostTag: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        if (!existingPost) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_FOOD_POST.customError });
        }
        const reply = {
            id: existingPost.id,
            description: existingPost.description,
            author: existingPost.author,
            foodImages: existingPost.foodPostImages,
            isLike: !userId ? false : existingPost.foodPostLikeUserRelation.length === 0 ? false : true,
            likeCount: existingPost._count.foodPostLikeUserRelation,
            tags: existingPost.foodPostTagReltaion.map((v) => {
                return { id: v.foodPostTag.id, title: v.foodPostTag.title };
            }),
            createdAt: existingPost.createdAt,
            updatedAt: existingPost.updatedAt,
        };
        const getViewCnt = await this.redis.get(redisPrefix.foodPostViewCount(existingPost.id));
        const getViewedPost = await this.redis.get(redisPrefix.alreadyViewedFood(existingPost.id, clientIp));
        if (!getViewedPost) {
            if (getViewCnt) {
                const redisViewCnt = JSON.parse(getViewCnt);
                redisViewCnt.viewCount = redisViewCnt.viewCount + 1;
                await this.redis.set(redisPrefix.foodPostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
            } else {
                const redisViewCnt = { viewCount: existingPost.viewCount + 1 };
                await this.redis.set(redisPrefix.foodPostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
            }
            await this.redis.set(redisPrefix.alreadyViewedFood(existingPost.id, clientIp), 'viewed', 'EX', 60);
            return reply;
        } else {
            return reply;
        }
    }

    async getFoodPosts(getFoodPostsArgs: GetFoodPostsArgs): Promise<GetFoodPostsRes> {
        const { size, cursor } = getFoodPostsArgs;

        const posts = await this.prismaDatabase.foodPost.findMany({
            take: size,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: 'desc' },
            ...(cursor && { cursor: { id: cursor } }),
            select: {
                id: true,
                description: true,
                author: {
                    select: {
                        nickname: true,
                        profileImageUrl: true,
                    },
                },
                foodPostImages: {
                    take: 1,
                    select: {
                        url: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });

        let hasMore = true;
        if (posts.length < size) {
            hasMore = false;
        }
        const reply = posts.map((v) => {
            return {
                id: v.id,
                description: v.description,
                author: v.author,
                imageUrl: v.foodPostImages[0].url,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
            };
        });
        return {
            hasMore,
            foodPostList: reply,
        };
    }

    async createFoodPost(createFoodPost: CreateFoodPostArgs, authorId: string): Promise<CreateFoodPostRes> {
        const { description, tags, foodImages } = createFoodPost;

        try {
            const res = await this.prismaDatabase.foodPost.create({
                data: {
                    description,
                    authorId,
                    ...(!!tags &&
                        tags.length > 0 && {
                            foodPostTagReltaion: {
                                create: tags.map((title) => {
                                    return {
                                        foodPostTag: {
                                            connectOrCreate: {
                                                where: { title },
                                                create: {
                                                    title,
                                                    createdAt: new Date(),
                                                },
                                            },
                                        },
                                        createdAt: new Date(),
                                    };
                                }),
                            },
                        }),
                    ...(foodImages.length > 0 && {
                        foodPostImages: {
                            createMany: {
                                data: foodImages,
                            },
                        },
                    }),
                },
                select: {
                    id: true,
                    description: true,
                    author: {
                        select: {
                            nickname: true,
                            profileImageUrl: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                    foodPostImages: {
                        take: 1,
                        select: {
                            url: true,
                        },
                    },
                },
            });

            return {
                ...res,
                imageUrl: res.foodPostImages[0].url,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_FOOD_POST_FAILURE.customError });
        }
    }

    async deleteFoodPost(foodPostId: number, userId: string): Promise<DeleteFoodPostRes> {
        try {
            const existingPost = await this.prismaDatabase.foodPost.findUnique({
                where: { id: foodPostId },
                select: { authorId: true },
            });
            if (!existingPost || existingPost.authorId !== userId) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }

            const res = await this.prismaDatabase.foodPost.delete({
                where: { id: foodPostId },
                select: { id: true },
            });
            return { foodPostId: res.id };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_FOOD_POST_FAILURE.customError });
        }
    }

    async modifyFoodPost(modifyFoodPostArgs: ModifyFoodPostArgs, authorId: string): Promise<GetFoodPostDetailRes> {
        const { foodPostId, description, tags, foodImages } = modifyFoodPostArgs;

        const existingData = await this.prismaDatabase.foodPost.findUnique({
            where: { id: foodPostId },
            select: {
                authorId: true,
                foodPostTagReltaion: {
                    select: {
                        foodPostTag: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                foodPostImages: {
                    where: { foodPostId },
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
        });

        if (!existingData) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_FOOD_POST.customError });
        }

        if (existingData.authorId !== authorId) {
            throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
        }

        const createTags =
            tags && tags.length > 0
                ? tags.filter((v) => {
                      const existingTitle = existingData.foodPostTagReltaion.map((v) => {
                          return v.foodPostTag.title;
                      });
                      return !existingTitle.includes(v);
                  })
                : [];

        const deleteTags =
            tags && tags.length > 0
                ? existingData.foodPostTagReltaion
                      .filter((v) => {
                          return !tags.includes(v.foodPostTag.title);
                      })
                      .map((v) => v.foodPostTag.id)
                : existingData.foodPostTagReltaion.map((v) => v.foodPostTag.id);

        const createFoodImages = foodImages.filter((v) => typeof v.id === 'undefined');
        const modifyFoodImages = foodImages.filter((v) => typeof v.id === 'number');
        const deleteFoodImages = existingData.foodPostImages
            .filter((v) => {
                const foodImageIds = foodImages.map((v) => v.id);
                return !foodImageIds.includes(v.id);
            })
            .map((v) => v.id);

        const res = await this.prismaDatabase.foodPost.update({
            where: { id: foodPostId },
            data: {
                description,
                foodPostTagReltaion: {
                    ...(createTags.length > 0 && {
                        create: createTags.map((v) => {
                            return {
                                foodPostTag: {
                                    connectOrCreate: {
                                        where: { title: v },
                                        create: {
                                            title: v,
                                            createdAt: new Date(),
                                        },
                                    },
                                },
                                createdAt: new Date(),
                            };
                        }),
                    }),
                    ...(deleteTags.length > 0 && {
                        deleteMany: {
                            foodPostTagId: {
                                in: deleteTags,
                            },
                        },
                    }),
                },
                foodPostImages: {
                    ...(deleteFoodImages.length > 0 && {
                        deleteMany: {
                            id: {
                                in: deleteFoodImages,
                            },
                        },
                    }),
                    ...(createFoodImages.length > 0 && {
                        createMany: {
                            data: createFoodImages,
                        },
                    }),
                    ...(modifyFoodImages.length > 0 && {
                        updateMany: modifyFoodImages.map((v) => {
                            return {
                                where: { id: v.id },
                                data: { url: v.url },
                            };
                        }),
                    }),
                },
            },
            select: {
                id: true,
                description: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImageUrl: true,
                        introduction: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
                viewCount: true,
                foodPostImages: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
                foodPostLikeUserRelation: {
                    where: { userId: authorId },
                },
                _count: {
                    select: {
                        foodPostLikeUserRelation: true,
                    },
                },
                foodPostTagReltaion: {
                    select: {
                        foodPostTag: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        const reply = {
            id: res.id,
            description: res.description,
            author: res.author,
            foodImages: res.foodPostImages,
            isLike: !authorId ? false : res.foodPostLikeUserRelation.length === 0 ? false : true,
            likeCount: res._count.foodPostLikeUserRelation,
            tags: res.foodPostTagReltaion.map((v) => {
                return { id: v.foodPostTag.id, title: v.foodPostTag.title };
            }),
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
        };
        return reply;
    }

    async likeFoodPost(likeFoodPostArgs: LikeFoodPostArgs, userId: string): Promise<LikeFoodPostRes> {
        const { foodPostId, likeType } = likeFoodPostArgs;

        const existingData = await this.prismaDatabase.foodPostLikeUserRelation.findUnique({
            where: { userId_foodPostId: { foodPostId, userId } },
        });

        if (likeType === LikeTypeLabel.like) {
            if (existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const createData = await this.prismaDatabase.foodPostLikeUserRelation.create({
                data: {
                    foodPostId,
                    userId,
                },
            });
            return {
                foodPostId: createData.foodPostId,
                likeType,
            };
        } else {
            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const deleteData = await this.prismaDatabase.foodPostLikeUserRelation.delete({
                where: { userId_foodPostId: { foodPostId, userId } },
            });

            return {
                foodPostId: deleteData.foodPostId,
                likeType,
            };
        }
    }

    async getPopularFoodPosts(): Promise<GetPopularFoodPostsRes> {
        const posts = await this.prismaDatabase.foodPost.findMany({
            take: 10,
            orderBy: [{ foodPostLikeUserRelation: { _count: 'desc' } }, { viewCount: 'desc' }],
            select: {
                id: true,
                description: true,
                author: {
                    select: {
                        nickname: true,
                        profileImageUrl: true,
                    },
                },
                foodPostImages: {
                    take: 1,
                    select: { url: true },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
        const reply = posts.map((v) => {
            return {
                id: v.id,
                description: v.description,
                author: v.author,
                imageUrl: v.foodPostImages[0].url,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
            };
        });
        return {
            foodPostList: reply,
        };
    }
}
