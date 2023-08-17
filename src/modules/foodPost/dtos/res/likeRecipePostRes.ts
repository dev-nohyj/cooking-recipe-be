import { ApiProperty } from '@nestjs/swagger';

export class LikeFoodPostRes {
    @ApiProperty({
        default: 'asd-gre-asdf',
        description: 'userId',
    })
    userId: string;

    @ApiProperty({
        default: 1,
        description: 'foodPostId',
    })
    foodPostId: number;

    @ApiProperty({
        description: '생성일',
    })
    createdAt: Date;
}
