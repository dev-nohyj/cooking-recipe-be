import { Injectable } from '@nestjs/common';
import { PrismaDatabase } from 'src/prisma/prisma.service';
import { CustomError } from 'src/error/custom.error';
import { customErrorLabel } from 'src/asset/labels/error';
import { LikeTypeLabel } from 'src/asset/labels/common';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { redisPrefix } from 'src/asset/prefix';
import {
    GetRecipeCommentListArgs,
    ModifyRecipeCommentArgs,
    CreateRecipeCommentArgs,
} from './dtos/args/recipeCommentArgs';
import {
    GetRecipePostCommentRes,
    ModifyRecipePostCommentRes,
    DeleteRecipePostCommentRes,
    CreateRecipePostCommentRes,
} from './dtos/res/recipeCommentRes';
import {
    GetRecipePostsArgs,
    ModifyRecipePostArgs,
    CreateRecipePostArgs,
    LikeRecipePostArgs,
} from './dtos/args/recipePostArgs';
import {
    GetRecipePostsRes,
    GetRecipePostDetailRes,
    LikeRecipePostRes,
    CreateRecipePostRes,
    DeleteRecipePostRes,
} from './dtos/res/recipePostRes';

@Injectable()
export class RecipePostService {
    //@ts-ignore
    constructor(private readonly prismaDatabase: PrismaDatabase, @InjectRedis() private readonly redis: Redis) {}

    async getRecipePosts(
        getRecipePostsArgs: GetRecipePostsArgs,
        userId: string | undefined,
    ): Promise<GetRecipePostsRes> {
        const { category, size, cursor } = getRecipePostsArgs;
        const recipePosts = await this.prismaDatabase.recipePost.findMany({
            where: { category },
            take: size,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: 'desc' },
            ...(cursor && { cursor: { id: cursor } }),
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        nickname: true,
                        profileImageUrl: true,
                    },
                },
                recipePostLikeUserRelation: {
                    where: { userId },
                },
                _count: {
                    select: {
                        recipePostLikeUserRelation: true,
                    },
                },
            },
        });

        let hasMore = true;
        if (recipePosts.length < size) {
            hasMore = false;
        }
        const reply = recipePosts.map((v) => {
            return {
                id: v.id,
                title: v.title,
                thumbnailUrl: v.thumbnailUrl,
                author: v.author,
                isLike: !userId ? false : v.recipePostLikeUserRelation.length === 0 ? false : true,
                likeCount: v._count.recipePostLikeUserRelation,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
            };
        });
        return {
            hasMore,
            recipePostList: reply,
        };
    }

    async getDetailRecipePost(
        recipePostId: number,
        clientIp: string | undefined,
        userId: string | undefined,
    ): Promise<GetRecipePostDetailRes> {
        const existingPost = await this.prismaDatabase.recipePost.findUnique({
            where: { id: recipePostId },
            select: {
                id: true,
                thumbnailUrl: true,
                title: true,
                content: true,
                category: true,
                createdAt: true,
                updatedAt: true,
                viewCount: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImageUrl: true,
                        introduction: true,
                    },
                },
                recipePostLikeUserRelation: {
                    where: { userId },
                },
                _count: {
                    select: {
                        recipePostLikeUserRelation: true,
                        recipePostComment: {
                            where: { parentId: null },
                        },
                    },
                },
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
        const reply = {
            id: existingPost.id,
            thumbnailUrl: existingPost.thumbnailUrl,
            title: existingPost.title,
            content: existingPost.content,
            category: existingPost.category,
            createdAt: existingPost.createdAt,
            updatedAt: existingPost.updatedAt,
            author: existingPost.author,
            isLike: !userId ? false : existingPost.recipePostLikeUserRelation.length === 0 ? false : true,
            likeCount: existingPost._count.recipePostLikeUserRelation,
            tags: existingPost.recipePostTagReltaion.map((v) => {
                return { id: v.recipePostTag.id, title: v.recipePostTag.title };
            }),
            commentCount: existingPost._count.recipePostComment,
        };
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

            return reply;
        } else {
            return reply;
        }
    }

    async createRecipePost(createRecipePostArgs: CreateRecipePostArgs, authorId: string): Promise<CreateRecipePostRes> {
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
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    author: {
                        select: {
                            nickname: true,
                            profileImageUrl: true,
                        },
                    },
                },
            });

            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_RECIPE_POST_FAILURE.customError });
        }
    }

    async deleteRecipePost(recipePostId: number, userId: string): Promise<DeleteRecipePostRes> {
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
            return {
                recipePostId: res.id,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_RECIPE_POST_FAILURE.customError });
        }
    }

    async modifyRecipePost(
        modifyRecipePostArgs: ModifyRecipePostArgs,
        userId: string,
    ): Promise<GetRecipePostDetailRes> {
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
                select: {
                    id: true,
                    thumbnailUrl: true,
                    title: true,
                    content: true,
                    category: true,
                    createdAt: true,
                    updatedAt: true,
                    viewCount: true,
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImageUrl: true,
                            introduction: true,
                        },
                    },
                    recipePostLikeUserRelation: {
                        where: { userId },
                    },
                    _count: {
                        select: {
                            recipePostLikeUserRelation: true,
                            recipePostComment: true,
                        },
                    },
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

            const reply = {
                id: res.id,
                thumbnailUrl: res.thumbnailUrl,
                title: res.title,
                content: res.content,
                category: res.category,
                createdAt: res.createdAt,
                updatedAt: res.updatedAt,
                author: res.author,
                isLike: !userId ? false : res.recipePostLikeUserRelation.length === 0 ? false : true,
                likeCount: res._count.recipePostLikeUserRelation,
                tags: res.recipePostTagReltaion.map((v) => {
                    return { id: v.recipePostTag.id, title: v.recipePostTag.title };
                }),
                commentCount: res._count.recipePostComment,
            };
            return reply;
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

            return {
                likeType,
                recipePostId: createData.recipePostId,
            };
        } else {
            if (!existingData) {
                throw new CustomError({ customError: customErrorLabel.BAD_REQUEST.customError });
            }
            const deleteData = await this.prismaDatabase.recipePostLikeUserRelation.delete({
                where: { userId_recipePostId: { recipePostId, userId } },
            });

            return {
                likeType,
                recipePostId: deleteData.recipePostId,
            };
        }
    }

    async getCommentList(getRecipeCommentListArgs: GetRecipeCommentListArgs): Promise<GetRecipePostCommentRes> {
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
                    writer: {
                        select: {
                            id: true,
                            profileImageUrl: true,
                            nickname: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            });
            let hasMore = true;
            if (commentData.length < size) {
                hasMore = false;
            }
            const commentList = commentData.map((v) => {
                return {
                    id: v.id,
                    comment: v.comment,
                    writer: v.writer,
                    createdAt: v.createdAt,
                    updatedAt: v.updatedAt,
                    deletedAt: v.deletedAt,
                };
            });
            return {
                hasMore,
                commentList,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.GET_COMMENT_FAILURE.customError });
        }
    }

    async createComment(
        createRecipeCommentArgs: CreateRecipeCommentArgs,
        userId: string,
    ): Promise<CreateRecipePostCommentRes> {
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
                select: {
                    id: true,
                    comment: true,
                    writer: {
                        select: {
                            id: true,
                            profileImageUrl: true,
                            nickname: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            });

            return res;
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.CREATE_COMMENT_FAILURE.customError });
        }
    }

    async modifyComment(
        modifyRecipeCommentArgs: ModifyRecipeCommentArgs,
        userId: string,
    ): Promise<ModifyRecipePostCommentRes> {
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
                select: {
                    id: true,
                    comment: true,
                    updatedAt: true,
                },
            });
            return {
                commentId: res.id,
                comment: res.comment,
                updatedAt: res.updatedAt,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.MODIFY_COMMENT_FAILURE.customError });
        }
    }

    async deleteComment(commentId: number, userId: string): Promise<DeleteRecipePostCommentRes> {
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
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            return {
                commentId: res.id,
                deletedAt: res.deletedAt!,
            };
        } catch (err) {
            throw new CustomError({ customError: customErrorLabel.DELETE_COMMENT_FAILURE.customError });
        }
    }
}
