import { Body, Controller, Post, UseGuards, Request, Get, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    async createPost(@Body() createPostDto: CreatePostDto, @Request() req, 
        @UploadedFiles() files: Array<Express.Multer.File>) {
        createPostDto.author = req.user.sub;
        return this.postService.createPost(createPostDto, files);
    }

    @Get()
    async getAllPosts() {
        return this.postService.getAllPosts();
    }

    @Put('/like/:postId')
    @UseGuards(AuthGuard)
    async likePost(@Request() req) {
        return this.postService.likePost(req.params.postId, req.user.sub);
    }

    @Put('/unlike/:postId')
    @UseGuards(AuthGuard)
    async unlikePost(@Request() req) {
        return this.postService.unlikePost(req.params.postId, req.user.sub);
    }
}
