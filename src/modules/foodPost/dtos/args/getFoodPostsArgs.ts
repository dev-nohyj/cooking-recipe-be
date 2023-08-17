import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class GetFoodPostsArgs {
    @ApiProperty({
        default: 20,
        description: 'size',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    size: number;

    @ApiProperty({
        description: 'cursor (post lastId)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    @Type(() => Number)
    cursor: number;
}
