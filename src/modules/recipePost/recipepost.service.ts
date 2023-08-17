import { Injectable } from '@nestjs/common';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { CustomError } from 'src/error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { LikeRecipePostRes } from './dtos/res/likeRecipePostRes';
import { GetRecipePostsArgs } from './dtos/args/getRecipePostsArgs';
import { CreateRecipePostArgs } from './dtos/args/createRecipePostArgs';
import { ModifyRecipePostArgs } from './dtos/args/modifyRecipePostArgs';
import { LikeRecipePostArgs } from './dtos/args/likeRecipePostArgs';
import {
    CreateRecipeCommentArgs,
    GetRecipeCommentListArgs,
    ModifyRecipeCommentArgs,
} from './dtos/args/RecipeCommentArgs';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { redisPrefix } from 'src/asset/prefix';

@Injectable()
export class RecipePostService {
    //@ts-ignore
    constructor(private readonly prismaDatabase: PrismaDatabase, @InjectRedis() private readonly redis: Redis) {}

    async getRecipePosts(getRecipePostsArgs: GetRecipePostsArgs) {
        const { category, size, cursor } = getRecipePostsArgs;
        const posts = await this.prismaDatabase.recipePost.findMany({
            where: { category },
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

    async getDetailRecipePost(recipePostId: number, clientIp: string | undefined) {
        const existingPost = await this.prismaDatabase.recipePost.findUnique({
            where: { id: recipePostId },
        });
        if (!existingPost) {
            throw new CustomError({ customError: customErrorLabel.NO_EXISTING_RECIPE_POST.customError });
        }
        const getViewCnt = await this.redis.get(redisPrefix.recipePostViewCount(existingPost.id));
        const getViewedPost = await this.redis.get(redisPrefix.alreadyViewedRecipe(existingPost.id, clientIp));
        if (!getViewedPost) {
            if (getViewCnt) {
                const redisViewCnt = JSON.parse(getViewCnt);
                redisViewCnt.viewCount = redisViewCnt.viewCount + 1;
                await this.redis.set(redisPrefix.recipePostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
            } else {
                const redisViewCnt = { viewCount: existingPost.viewCount + 1 };
                await this.redis.set(redisPrefix.recipePostViewCount(existingPost.id), JSON.stringify(redisViewCnt));
            }
            await this.redis.set(redisPrefix.alreadyViewedRecipe(existingPost.id, clientIp), 'viewed', 'EX', 60);
            return existingPost;
        } else {
            return existingPost;
        }
    }

    async createRecipePost(createRecipePostArgs: CreateRecipePostArgs, authorId: string) {
        const { title, content, thumbnailUrl, category, tags } = createRecipePostArgs;
        try {
            const res = await this.prismaDatabase.recipePost.create({
                data: {
                    title,
                    content,
                    thumbnailUrl,
                    category,
                    authorId,
                    ...(!!tags &&
                        tags.length > 0 && {
                            recipePostTagReltaion: {
                                create: tags.map((title) => {
                                    return {
                                        recipePostTag: {
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
                },
            });

            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_RECIPE_POST_FAILURE.customError });
        }
    }

    async deleteRecipePost(recipePostId: number, userId: string) {
        try {
            const existingPost = await this.prismaDatabase.recipePost.findUnique({
                where: { id: recipePostId },
                select: { authorId: true },
            });
            if (!existingPost || existingPost.authorId !== userId) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }

            const res = await this.prismaDatabase.recipePost.delete({
                where: { id: recipePostId },
                select: { id: true },
            });
            return res.id;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_RECIPE_POST_FAILURE.customError });
        }
    }

    async modifyRecipePost(modifyRecipePostArgs: ModifyRecipePostArgs, userId: string) {
        const { title, content, thumbnailUrl, category, tags, recipePostId } = modifyRecipePostArgs;

        try {
            const existingPost = await this.prismaDatabase.recipePost.findUnique({
                where: { id: recipePostId },
                select: {
                    id: true,
                    authorId: true,
                    recipePostTagReltaion: {
                        select: {
                            recipePostTag: {
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
                throw new CustomError({ customError: customErrorLabel.NO_EXISTING_RECIPE_POST.customError });
            }
            if (existingPost.authorId !== userId) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }

            const createTags =
                tags && tags.length > 0
                    ? tags.filter((v) => {
                          const existingTitle = existingPost.recipePostTagReltaion.map((v) => {
                              return v.recipePostTag.title;
                          });
                          return !existingTitle.includes(v);
                      })
                    : [];

            const deleteTags =
                tags && tags.length > 0
                    ? existingPost.recipePostTagReltaion
                          .filter((v) => {
                              return !tags.includes(v.recipePostTag.title);
                          })
                          .map((v) => v.recipePostTag.id)
                    : existingPost.recipePostTagReltaion.map((v) => v.recipePostTag.id);

            const res = await this.prismaDatabase.recipePost.update({
                where: { id: recipePostId },
                data: {
                    title,
                    content,
                    thumbnailUrl,
                    category,
                    recipePostTagReltaion: {
                        ...(createTags.length > 0 && {
                            create: createTags.map((v) => {
                                return {
                                    recipePostTag: {
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
                                recipePostTagId: {
                                    in: deleteTags,
                                },
                            },
                        }),
                    },
                },
            });
            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.MODIFY_RECIPE_POST_FAILURE.customError });
        }
    }

    async likeRecipePost(likeRecipePostArgs: LikeRecipePostArgs, userId: string): Promise<LikeRecipePostRes> {
        const { recipePostId, likeType } = likeRecipePostArgs;
        const existingData = await this.prismaDatabase.recipePostLikeUserRelation.findUnique({
            where: { userId_recipePostId: { recipePostId, userId } },
        });

        if (likeType === LikeTypeLabel.like) {
            if (existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const createData = await this.prismaDatabase.recipePostLikeUserRelation.create({
                data: {
                    recipePostId,
                    userId,
                },
            });
            return createData;
        } else {
            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const deleteData = await this.prismaDatabase.recipePostLikeUserRelation.delete({
                where: { userId_recipePostId: { recipePostId, userId } },
            });

            return deleteData;
        }
    }

    async getCommentList(getRecipeCommentListArgs: GetRecipeCommentListArgs) {
        const { size, cursor, recipePostId, parentId } = getRecipeCommentListArgs;
        try {
            const existingPost = await this.prismaDatabase.recipePost.findUnique({ where: { id: recipePostId } });
            if (!existingPost) {
                throw new CustomError({ customError: customErrorLabel.NO_EXISTING_RECIPE_POST.customError });
            }

            const commentData = await this.prismaDatabase.recipePostComment.findMany({
                where: { recipePostId, parentId: typeof parentId === 'number' ? parentId : null },
                orderBy: { createdAt: typeof parentId === 'number' ? 'asc' : 'desc' },
                take: size,
                skip: cursor ? 1 : 0,
                ...(cursor && { cursor: { id: cursor } }),
                select: {
                    id: true,
                    comment: true,
                    writer: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    _count: {
                        select: {
                            children: true,
                        },
                    },
                },
            });
            let hasMore = true;
            if (commentData.length < size) {
                hasMore = false;
            }
            return {
                hasMore,
                commentData,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.GET_COMMENT_FAILURE.customError });
        }
    }

    async createComment(createRecipeCommentArgs: CreateRecipeCommentArgs, userId: string) {
        const { recipePostId, comment, parentId } = createRecipeCommentArgs;
        try {
            const existingPost = await this.prismaDatabase.recipePost.findUnique({ where: { id: recipePostId } });
            if (!existingPost) {
                throw new CustomError({ customError: customErrorLabel.NO_EXISTING_RECIPE_POST.customError });
            }

            const res = await this.prismaDatabase.recipePostComment.create({
                data: {
                    comment,
                    writerId: userId,
                    parentId,
                    recipePostId,
                },
            });
            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_COMMENT_FAILURE.customError });
        }
    }

    async modifyComment(modifyRecipeCommentArgs: ModifyRecipeCommentArgs, userId: string) {
        const { comment, commentId } = modifyRecipeCommentArgs;

        try {
            const existingData = await this.prismaDatabase.recipePostComment.findUnique({
                where: {
                    id: commentId,
                },
                select: {
                    writerId: true,
                },
            });

            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            if (existingData.writerId !== userId) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const res = await this.prismaDatabase.recipePostComment.update({
                where: { id: commentId },
                data: {
                    comment,
                },
            });
            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.MODIFY_COMMENT_FAILURE.customError });
        }
    }

    async deleteComment(commentId: number, userId: string) {
        try {
            const existingData = await this.prismaDatabase.recipePostComment.findUnique({
                where: {
                    id: commentId,
                },
                select: {
                    writerId: true,
                },
            });

            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            if (existingData.writerId !== userId) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const res = await this.prismaDatabase.recipePostComment.update({
                where: { id: commentId },
                data: { deletedAt: new Date() },
            });
            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_COMMENT_FAILURE.customError });
        }
    }
}
