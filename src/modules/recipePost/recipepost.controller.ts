import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiTagLabel } from 'src/asset/labels/common';
import { SwaggerReply } from 'src/decorators/swaggerReply.decorators';
import { CustomSession } from 'express-session';
import { RecipePostService } from './recipepost.service';
import { RecipePostIdArgs } from './dtos/args/commonArgs';
import { NoAuth } from 'src/decorators/noAuth.decorators';
import {
    CommentIdArgs,
    CreateRecipeCommentArgs,
    GetRecipeCommentListArgs,
    ModifyRecipeCommentArgs,
} from './dtos/args/recipeCommentArgs';
import { Request } from 'express';
import {
    CreateRecipePostCommentRes,
    DeleteRecipePostCommentRes,
    GetRecipePostCommentRes,
    ModifyRecipePostCommentRes,
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

@ApiTags(ApiTagLabel.recipePost)
@Controller('recipe')
export class RecipePostController {
    constructor(private readonly recipePostService: RecipePostService) {}

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 조회',
        type: GetRecipePostsRes,
    })
    @Get('')
    getRecipePosts(@Query() getRecipePostsArgs: GetRecipePostsArgs, @Session() session: CustomSession) {
        return this.recipePostService.getRecipePosts(getRecipePostsArgs, session.userId);
    }

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 상세 조회',
        type: GetRecipePostDetailRes,
    })
    @Get('/detail/:recipePostId')
    getDetailRecipePost(
        @Req() { clientIp }: Request,
        @Param() { recipePostId }: RecipePostIdArgs,
        @Session() session: CustomSession,
    ) {
        return this.recipePostService.getDetailRecipePost(recipePostId, clientIp, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 추가',
        type: CreateRecipePostRes,
    })
    @Post('create')
    createRecipePost(@Body() createRecipePostArgs: CreateRecipePostArgs, @Session() session: CustomSession) {
        return this.recipePostService.createRecipePost(createRecipePostArgs, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 삭제',
        type: DeleteRecipePostRes,
    })
    @Delete('delete')
    deleteRecipePost(@Query() { recipePostId }: RecipePostIdArgs, @Session() session: CustomSession) {
        return this.recipePostService.deleteRecipePost(recipePostId, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 수정',
        type: GetRecipePostDetailRes,
    })
    @Put('modify')
    modifyRecipePost(@Body() modifyRecipePostArgs: ModifyRecipePostArgs, @Session() session: CustomSession) {
        return this.recipePostService.modifyRecipePost(modifyRecipePostArgs, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 좋아요 / 좋아요 취소',
        type: LikeRecipePostRes,
    })
    @Patch('like')
    likeRecipePost(@Body() likeRecipePostArgs: LikeRecipePostArgs, @Session() session: CustomSession) {
        return this.recipePostService.likeRecipePost(likeRecipePostArgs, session.userId);
    }

    @NoAuth()
    @SwaggerReply({
        summary: '댓글 조회',
        type: GetRecipePostCommentRes,
    })
    @Get('comment')
    getCommentList(@Query() getRecipeCommentListArgs: GetRecipeCommentListArgs) {
        return this.recipePostService.getCommentList(getRecipeCommentListArgs);
    }

    @SwaggerReply({
        summary: '댓글 작성',
        type: CreateRecipePostCommentRes,
    })
    @Post('comment')
    createComment(@Body() createRecipeCommentArgs: CreateRecipeCommentArgs, @Session() session: CustomSession) {
        return this.recipePostService.createComment(createRecipeCommentArgs, session.userId);
    }

    @SwaggerReply({
        summary: '댓글 수정',
        type: ModifyRecipePostCommentRes,
    })
    @Patch('comment')
    modifyComment(@Body() modifyRecipeCommentArgs: ModifyRecipeCommentArgs, @Session() session: CustomSession) {
        return this.recipePostService.modifyComment(modifyRecipeCommentArgs, session.userId);
    }

    @SwaggerReply({
        summary: '댓글 삭제',
        type: DeleteRecipePostCommentRes,
    })
    @Delete('comment')
    deleteComment(@Query() { commentId }: CommentIdArgs, @Session() session: CustomSession) {
        return this.recipePostService.deleteComment(commentId, session.userId);
    }
}
