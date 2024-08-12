import { Body, Controller, Post, UseGuards, Request, Get, Put } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    @UseGuards(AuthGuard)
    async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
        createPostDto.author = req.user.sub;
        return this.postService.createPost(createPostDto);
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
