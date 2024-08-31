import { Body, Controller, Post, UseGuards, Request, Get, Put, UseInterceptors, UploadedFiles, Param, Query, Delete } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetPostFillterDto } from './dtos/get-post-fillter.dto';

@Controller('api/post')
@ApiTags('post')
@ApiBearerAuth()
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiConsumes('multipart/form-data')
    async createPost(@Body() createPostDto: CreatePostDto, @Request() req,
        @UploadedFiles() files: Array<Express.Multer.File>) {
        createPostDto.author = req.user.sub;
        if (files) {
            createPostDto.images = files;
        }
        return this.postService.createPost(createPostDto);
    }

    // @Get()
    // async getAllPosts() {
    //     return this.postService.getAllPosts();
    // }

    // @Get('/:postId')
    // async getPost(@Param('postId') postId: string) {
    //     return this.postService.getPostByPostId(postId);
    // }

    // @Get('/user/:userId')
    // async getPostByUserId(@Param('userId') userId: string) {
    //     return this.postService.getPostByUserId(userId);
    // }

    @Get('/search')
    async searchPosts(@Query() query: GetPostFillterDto) {
        return this.postService.getPostBySearch(query);
    }

    @Put('/like/:postId')
    @UseGuards(AuthGuard)
    async likePost(@Request() req, @Param('postId') postId: string) {
        return this.postService.likePost(postId, req.user.sub);
    }

    @Put('/unlike/:postId')
    @UseGuards(AuthGuard)
    async unlikePost(@Request() req, @Param('postId') postId: string) {
        return this.postService.unlikePost(postId, req.user.sub);
    }

    @Delete('/:postId')
    @UseGuards(AuthGuard)
    async deletePost(@Request() req, @Param('postId') postId: string) {
        return this.postService.deletePost(postId, req.user.sub);
    }
}
