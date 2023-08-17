import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiTagLabel } from 'src/asset/labels/common';
import { NoAuth } from 'src/decorators/noAuth.decorators';
import { SwaggerReply } from 'src/decorators/swaggerReply.decorators';
import { FoodPostService } from './foodpost.service';
import { CustomSession } from 'express-session';
import { LikeFoodPostRes } from './dtos/res/likeRecipePostRes';
import { FoodPostIdArgs } from './dtos/args/commonArgs';
import { GetFoodPostsArgs } from './dtos/args/getFoodPostsArgs';
import { LikeFoodPostArgs } from './dtos/args/likeFoodPostArgs';
import { CreateFoodPostArgs } from './dtos/args/createFoodPostArgs';
import { ModifyFoodPostArgs } from './dtos/args/modifyFoodPostArgs';

@ApiTags(ApiTagLabel.foodPost)
@Controller('food')
export class FoodPostController {
    constructor(private readonly foodPostService: FoodPostService) {}

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 조회',
    })
    @Get('')
    getFoodPosts(@Query() getFoodPostsArgs: GetFoodPostsArgs) {
        return this.foodPostService.getFoodPosts(getFoodPostsArgs);
    }

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 상세 조회',
    })
    @Get('/detail/:foodPostId')
    getDetailFoodPost(@Query() { foodPostId }: FoodPostIdArgs) {
        return this.foodPostService.getDetailFoodPost(foodPostId);
    }

    @SwaggerReply({
        summary: '게시물 추가',
    })
    @Post('create')
    createFoodPost(@Body() createFoodPostArgs: CreateFoodPostArgs, @Session() session: CustomSession) {
        return this.foodPostService.createFoodPost(createFoodPostArgs, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 삭제',
    })
    @Delete('delete')
    deleteFoodPost(@Query() { foodPostId }: FoodPostIdArgs, @Session() session: CustomSession) {
        return this.foodPostService.deleteFoodPost(foodPostId, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 수정',
    })
    @Put('modify')
    modifyFoodPost(@Body() modifyFoodPostArgs: ModifyFoodPostArgs, @Session() session: CustomSession) {
        return this.foodPostService.modifyFoodPost(modifyFoodPostArgs, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 좋아요 / 좋아요 취소',
        type: LikeFoodPostRes,
    })
    @Patch('like')
    likeFoodPost(@Body() likeFoodPostArgs: LikeFoodPostArgs, @Session() session: CustomSession) {
        return this.foodPostService.likeFoodPost(likeFoodPostArgs, session.userId);
    }
}
