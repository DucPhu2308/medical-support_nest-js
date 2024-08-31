import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePostDto } from './dtos/create-post.dto';
import { MONGO_SELECT } from 'src/common/constances';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';
import { GetPostFillterDto } from './dtos/get-post-fillter.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        private readonly firebaseService: FirebaseService,
        
    ) { }

    async createPost(createPostDto: CreatePostDto) {
        const files = createPostDto.images;

        if (files) {
            const images = await Promise.all(
                files.map(async (file) => {
                    return await this.firebaseService.uploadFile(file, UploadFolder.POST);
                })
            );

            return await this.postModel.create({
                ...createPostDto,
                images,
            });
        } else {
            return await this.postModel.create(createPostDto);
        }
        
    }

    async getAllPosts() {
        return await this.postModel.find()
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT);
    }

    async getPostByPostId(postId: string) {
        return await this.postModel.findById(postId)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT);
    }

    async getPostBySearch(filterDto: GetPostFillterDto) {
        const query : any = {};

        if (filterDto.postId) {
            query._id = new Types.ObjectId(filterDto.postId);
        }

        if (filterDto.userId) {
            query.author = new Types.ObjectId(filterDto.userId);
        }

        return this.postModel.find(query)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT);
    }

        

    async likePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const userObjectId = new Types.ObjectId(userId);

        // if user hasn't liked the post yet, add user to likedBy array
        if (!post.likedBy.includes(userObjectId)) {
            post.likedBy.push(userObjectId);
        }

        return await post.save();
    }

    async unlikePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const userObjectId = new Types.ObjectId(userId);

        // if user has liked the post, remove user from likedBy array
        if (post.likedBy.includes(userObjectId)) {
            post.likedBy = post.likedBy.filter(likedBy => likedBy.toString() !== userId);
        }

        return await post.save();
    }

    async deletePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        if (post.author.toString() !== userId) {
            throw new Error('Unauthorized');
        }

        await this.postModel.deleteOne({ _id: new Types.ObjectId(postId) });
        return 'Delete success';
    }
}
