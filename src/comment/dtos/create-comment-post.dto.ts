import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";



export class CreateCommentPostDto {
    @ApiProperty()
    @IsNotEmpty()
    postId: string;

    @ApiProperty()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    parentCommentId: string;

    @ApiProperty()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsOptional()
    imageContent: Express.Multer.File;
}