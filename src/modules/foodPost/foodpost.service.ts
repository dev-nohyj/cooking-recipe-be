import { Injectable } from '@nestjs/common';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { CustomError } from 'src/error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';
import { GetFoodPostsArgs } from './dtos/args/getFoodPostsArgs';
import { LikeFoodPostArgs } from './dtos/args/likeFoodPostArgs';
import { CreateFoodPostArgs } from './dtos/args/createFoodPostArgs';
import { ModifyFoodPostArgs } from './dtos/args/modifyFoodPostArgs';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { redisPrefix } from 'src/asset/prefix';

@Injectable()
export class FoodPostService {
    // @ts-ignore
    constructor(private readonly prismaDatabase: PrismaDatabase, @InjectRedis() private readonly redis: Redis) {}

    async getDetailFoodPost(foodPostId: number) {
        const existingPost = await this.prismaDatabase.foodPost.findUnique({
            where: { id: foodPostId },
        });
        if (!existingPost) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_FOOD_POST.customError });
        }
        const getViewCnt = await this.redis.get(redisPrefix.foodPostViewCount(existingPost.id));
        if (getViewCnt) {
            const redisViewCnt = JSON.parse(getViewCnt);
            redisViewCnt.viewCount = redisViewCnt.viewCount + 1;
            await this.redis.set(redisPrefix.foodPostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
        } else {
            const redisViewCnt = { viewCount: existingPost.viewCount + 1 };
            await this.redis.set(redisPrefix.foodPostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
        }
        return existingPost;
    }

    async getFoodPosts(getFoodPostsArgs: GetFoodPostsArgs) {
        const { size, cursor } = getFoodPostsArgs;

        const posts = await this.prismaDatabase.foodPost.findMany({
            take: size,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: 'desc' },
            ...(cursor && { cursor: { id: cursor } }),
        });

        let hasMore = true;
        if (posts.length < size) {
            hasMore = false;
        }

        return {
            hasMore,
            posts,
        };
    }

    async createFoodPost(createFoodPost: CreateFoodPostArgs, authorId: string) {
        const { mainImageUrl, description, tags, otherImages } = createFoodPost;
        const imageUrls =
            !!otherImages && otherImages.length > 0
                ? otherImages.map((v) => {
                      return { url: v };
                  })
                : [];
        try {
            const res = await this.prismaDatabase.foodPost.create({
                data: {
                    mainImageUrl,
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
                    ...(!!otherImages &&
                        otherImages.length > 0 && {
                            foodPostImages: {
                                createMany: {
                                    data: imageUrls,
                                },
                            },
                        }),
                },
            });

            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_FOOD_POST_FAILURE.customError });
        }
    }

    async deleteFoodPost(foodPostId: number, userId: string) {
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
            return res.id;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_FOOD_POST_FAILURE.customError });
        }
    }

    async modifyFoodPost(modifyFoodPostArgs: ModifyFoodPostArgs, authorId: string) {
        const { foodPostId, mainImageUrl, description, tags, otherImages } = modifyFoodPostArgs;

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

        const deleteImages = existingData.foodPostImages
            .filter((v) => {
                const ids =
                    !!otherImages && otherImages.length > 0
                        ? otherImages.filter((v) => typeof v.id === 'number').map((v) => v.id)
                        : [];
                return !ids.includes(v.id);
            })
            .map((v) => v.id);

        const res = await this.prismaDatabase.foodPost.update({
            where: { id: foodPostId },
            data: {
                mainImageUrl,
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
                    ...(deleteImages.length > 0 && {
                        deleteMany: {
                            id: {
                                in: deleteImages,
                            },
                        },
                    }),
                    ...(!!otherImages &&
                        otherImages.length > 0 && {
                            updateMany: otherImages
                                .filter((v) => typeof v.id === 'number')
                                .map((image) => {
                                    return {
                                        where: { id: image.id },
                                        data: { url: image.url },
                                    };
                                }),
                            createMany: {
                                data: otherImages
                                    .filter((v) => typeof v.id === 'undefined')
                                    .map((image) => {
                                        return { url: image.url };
                                    }),
                            },
                        }),
                },
            },
        });
        return res;
    }

    async likeFoodPost(likeFoodPostArgs: LikeFoodPostArgs, userId: string) {
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
            return createData;
        } else {
            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const deleteData = await this.prismaDatabase.foodPostLikeUserRelation.delete({
                where: { userId_foodPostId: { foodPostId, userId } },
            });

            return deleteData;
        }
    }
}
