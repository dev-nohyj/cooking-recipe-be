import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

type ReplyOptions = {
    summary: string;
    type?: Type<unknown> | string;
    isArray?: boolean;
    desc?: string;
};

export const SwaggerReply = (options: ReplyOptions) => {
    const { summary, type, isArray, desc } = options;

    return applyDecorators(
        ApiOperation({ summary }),
        ApiResponse({
            isArray,
            description: desc ?? '',
            status: HttpStatus.OK,
            type,
        }),
    );
};
