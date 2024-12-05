import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsOptional, IsString } from "class-validator";


export class GetPostFillterDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    postId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    userId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    title?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    content?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    tagId?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @ApiPropertyOptional({ description: "Ngày bắt đầu" })
    createdAtFrom?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @ApiPropertyOptional({ description: "Ngày kết thúc" })
    createdAtTo?: Date;
}
