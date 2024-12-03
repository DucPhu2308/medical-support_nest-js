import { Body, Controller, Get, Param, Post, Put, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CommentService } from "./comment.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateCommentPostDto } from "./dtos/create-comment-post.dto";
import { Types } from "mongoose";
import { FileInterceptor } from "@nestjs/platform-express";




@Controller('/api/comment')
@ApiTags('comment')
@ApiBearerAuth()
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('imageContent'))
    async createComment(@Request() req, @Body() createCommentDto: CreateCommentPostDto,
            @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createCommentDto.imageContent = file;
        }
        return this.commentService.createComment(createCommentDto);
    }

    @Get("/post/:postId")
    async getCommentsByPostId(@Request() req, @Param('postId') postId: string) {
        const postIdObject = new Types.ObjectId(postId);
        return this.commentService.findCommentsByPostId(postIdObject);
    }

    @Put("/like/:commentId")
    @UseGuards(AuthGuard)
    async likeComment(@Request() req, @Param('commentId') commentId: string) {
        return this.commentService.likeComment(commentId, req.user.sub);
    }

    @Get("/:commentId")
    async getComment(@Request() req, @Param('commentId') commentId: string) {
        return this.commentService.getCommentById(commentId);
    }   
}