import { Type } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class CreatePostDto {
    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    @IsOptional()
    images: Array<Express.Multer.File>;

    author: string;

    @ApiPropertyOptional()
    @IsOptional()
    tags: string[];
}