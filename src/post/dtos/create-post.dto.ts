import { IsNotEmpty } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    content: string;
    author: string;
    // tags: string[];
}