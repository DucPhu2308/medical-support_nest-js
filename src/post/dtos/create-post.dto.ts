import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

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
    // tags: string[];
}