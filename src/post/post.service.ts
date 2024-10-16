import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePostDto } from './dtos/create-post.dto';
import { MONGO_SELECT } from 'src/common/constances';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';
import { GetPostFillterDto } from './dtos/get-post-fillter.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationService } from 'src/notification/notification.service';
import { types } from 'util';
import { Speciality } from 'src/schemas/speciality.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>,
        private readonly firebaseService: FirebaseService,
        private readonly notificationService: NotificationService,
        
    ) { }

    async createPost(createPostDto: CreatePostDto) {
        const files = createPostDto.images;
    
        // Tạo mảng tags dạng ObjectId nếu đầu vào hợp lệ
        let tags: Types.ObjectId[] = [];
        console.log(createPostDto.tags);
    
        if (createPostDto.tags) {
            for(let i = 0; i < createPostDto.tags.length; i++) {
                const tagId = createPostDto.tags[i];
                const tag = await this.specialityModel.findById(tagId);
                if (!tag) {
                    throw new Error('Tag not found');
                }
                tags.push(new Types.ObjectId(tagId));
            }
                
        }
    
        console.log("abc: ", tags);
    
        if (files) {
            const images = await Promise.all(
                files.map(async (file) => {
                    return await this.firebaseService.uploadFile(file, UploadFolder.POST);
                })
            );
    
            return await this.postModel.create({
                ...createPostDto,
                tags,  // Lưu tags đã chuyển đổi
                images,
            });
        } else {
            return await this.postModel.create({
                ...createPostDto,
                tags,  // Lưu tags đã chuyển đổi
            });
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
        const query: any = {};

        if (filterDto.postId) {
            query._id = new Types.ObjectId(filterDto.postId);
        }

        if (filterDto.userId) {
            query.author = new Types.ObjectId(filterDto.userId);
        }

        if (filterDto.title) {
            query.title = { $regex: filterDto.title, $options: 'i' };
        }

        if (filterDto.content) {
            query.content = { $regex: filterDto.content, $options: 'i' };
        }

        return this.postModel.find(query)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('lovedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('surprisedBy', MONGO_SELECT.USER.DEFAULT);

    }

    async getPostBySearchPagination(filterDto: GetPostFillterDto, page: number, limit: number) {
        const query: any = {};

        if (filterDto.postId) {
            query._id = new Types.ObjectId(filterDto.postId);
        }

        if (filterDto.userId) {
            query.author = new Types.ObjectId(filterDto.userId);
        }

        if (filterDto.title || filterDto.content) {
            query.$or = [];

            if (filterDto.title) {
                query.$or.push({ title: { $regex: filterDto.title, $options: 'i' } });
            }

            if (filterDto.content) {
                query.$or.push({ content: { $regex: filterDto.content, $options: 'i' } });
            }
        }



        const mongoQuery = this.postModel.find(query)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('lovedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('surprisedBy', MONGO_SELECT.USER.DEFAULT)

        if (page && limit) {
            mongoQuery.skip((page - 1) * limit).limit(limit);
        }

        return mongoQuery;
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

    async handleReaction(postId: string, userId: string, reactionType: 'like' | 'love' | 'surprise') {
        const post = await this.postModel.findById(postId);
        if (!post) throw new Error('Post not found');

        // Xóa cảm xúc khác của người dùng nếu có
        post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
        post.lovedBy = post.lovedBy.filter(id => id.toString() !== userId);
        post.surprisedBy = post.surprisedBy.filter(id => id.toString() !== userId);

        // Thêm cảm xúc mới
        if (reactionType === 'like') {
            post.likedBy.push(new Types.ObjectId(userId));
        } else if (reactionType === 'love') {
            post.lovedBy.push(new Types.ObjectId(userId));
        } else if (reactionType === 'surprise') {
            post.surprisedBy.push(new Types.ObjectId(userId));
        }

        if (reactionType && userId !== post.author.toString()) {
            this.notificationService.pushReactPostNotificationToQueue(userId, postId);
        }

        await post.save();
        return { message: `Post ${reactionType}d successfully` };
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
