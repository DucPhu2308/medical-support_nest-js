import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString } from "class-validator";


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

}
