import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



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
}