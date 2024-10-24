import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { CreatePostDto } from "./create-post.dto";



export class UpdatePostDto {
    // @ApiPropertyOptional()
    // @IsOptional()
    // title: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // content: string;

    // @ApiPropertyOptional({
    //     type: 'array',
    //     items: {
    //         type: 'string',
    //         format: 'binary',
    //     },
    // })
    // @IsOptional()
    // images: Array<Express.Multer.File>;

    @ApiPropertyOptional()
    @IsOptional()
    status: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // publishedBy: string;

}