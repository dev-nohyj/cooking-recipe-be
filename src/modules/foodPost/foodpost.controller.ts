import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiTagLabel } from 'src/asset/labels/common';
import { NoAuth } from 'src/decorators/noAuth.decorators';
import { SwaggerReply } from 'src/decorators/swaggerReply.decorators';
import { FoodPostService } from './foodpost.service';
import { CustomSession } from 'express-session';
import { FoodPostIdArgs } from './dtos/args/commonArgs';
import { Request } from 'express';
import { CreateFoodPostArgs, GetFoodPostsArgs, LikeFoodPostArgs, ModifyFoodPostArgs } from './dtos/args/foodPostArgs';
import {
    CreateFoodPostRes,
    DeleteFoodPostRes,
    GetFoodPostDetailRes,
    GetFoodPostsRes,
    LikeFoodPostRes,
} from './dtos/res/foodPostRes';

@ApiTags(ApiTagLabel.foodPost)
@Controller('food')
export class FoodPostController {
    constructor(private readonly foodPostService: FoodPostService) {}

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 조회',
        type: GetFoodPostsRes,
    })
    @Get('')
    getFoodPosts(@Query() getFoodPostsArgs: GetFoodPostsArgs, @Session() session: CustomSession) {
        return this.foodPostService.getFoodPosts(getFoodPostsArgs, session.userId);
    }

    @NoAuth()
    @SwaggerReply({
        summary: '게시물 상세 조회',
        type: GetFoodPostDetailRes,
    })
    @Get('/detail/:foodPostId')
    getDetailFoodPost(
        @Req() { clientIp }: Request,
        @Param() { foodPostId }: FoodPostIdArgs,
        @Session() session: CustomSession,
    ) {
        return this.foodPostService.getDetailFoodPost(foodPostId, clientIp, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 추가',
        type: CreateFoodPostRes,
    })
    @Post('create')
    createFoodPost(@Body() createFoodPostArgs: CreateFoodPostArgs, @Session() session: CustomSession) {
        return this.foodPostService.createFoodPost(createFoodPostArgs, session.userId);
    }

    @SwaggerReply({
        summary: '게시물 삭제',
        type: DeleteFoodPostRes,
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
