import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostStatus } from 'src/schemas/post.schema';
import { CreatePostDto } from './dtos/create-post.dto';
import { MONGO_SELECT } from 'src/common/constances';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';
import { GetPostFillterDto } from './dtos/get-post-fillter.dto';
import { NotificationService } from 'src/notification/notification.service';
import { Speciality } from 'src/schemas/speciality.schema';
import { UpdatePostDto } from './dtos/update-post.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly firebaseService: FirebaseService,
        private readonly notificationService: NotificationService,

    ) { }

    async createPost(createPostDto: CreatePostDto) {
        const files = createPostDto.images;

        // Initialize the tags array
        let tags: Types.ObjectId[] = [];
        let status = PostStatus.PENDING;

        // Ensure tags is always an array (even if a single tag is provided)
        const tagInput = typeof createPostDto.tags === 'string'
            ? createPostDto.tags.split(',')
            : Array.isArray(createPostDto.tags)
                ? createPostDto.tags
                : [createPostDto.tags];

        // Process tags asynchronously
        if (tagInput && tagInput.length > 0) {
            tags = await Promise.all(
                tagInput.map(async (tag) => {
                    const speciality = await this.specialityModel.findById(tag);
                    if (speciality) {
                        return new Types.ObjectId(tag);
                    }
                })
            );
            // Filter out undefined values from tags array
            tags = tags.filter(tag => tag !== undefined);
        }

        const author = await this.userModel.findById(createPostDto.author);

        if (author.roles.includes('DOCTOR')) {
            status = PostStatus.PUBLISHED;
        }

        // If there are images, upload them
        if (files) {
            const images = await Promise.all(
                files.map(async (file) => {
                    return await this.firebaseService.uploadFile(file, UploadFolder.POST);
                })
            );

            // Save the post with both images and tags (if any)
            return await this.postModel.create({
                ...createPostDto,
                tags,  // Save tags (if any)
                images,  // Save images
                status,
            });
        } else {
            // Save the post without images but with tags (if any)
            return await this.postModel.create({
                ...createPostDto,
                tags,  // Save tags (if any)
                status,
            });
        }
    }



    async getAllPosts() {
        return await this.postModel.find()
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT);
    }

    // async getPostByPostId(postId: string) {
    //     return await this.postModel.findById(postId)
    //         .populate('author', MONGO_SELECT.USER.DEFAULT)
    //         .populate('likedBy', MONGO_SELECT.USER.DEFAULT);
    // }

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

        return await this.postModel.find(query)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('lovedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('surprisedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('tags', MONGO_SELECT.SPECIALITY.DEFAULT)
    }

    async getPostBySearchPagination(filterDto: GetPostFillterDto, page: number, limit: number) {
        const query: any = {};
 
        if (filterDto.postId) {
            query._id = new Types.ObjectId(filterDto.postId);
            
        }

        if (filterDto.userId) {
            query.author = new Types.ObjectId(filterDto.userId);
        }

        if (filterDto.tagId) {
            query.tags = { $in: [new Types.ObjectId(filterDto.tagId)] };
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


        let mongoQuery = this.postModel.find(query)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('lovedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('surprisedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('tags', MONGO_SELECT.SPECIALITY.DEFAULT);

        if (page && limit) {
            mongoQuery = mongoQuery.skip((page - 1) * limit).limit(limit);
        }

        // Execute the query and return the result
        return await mongoQuery.exec();
    }

    async getPostByPostId(postId: string) {
        return await this.postModel.findById(postId)
            .populate('author', MONGO_SELECT.USER.DEFAULT)
            .populate('likedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('lovedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('surprisedBy', MONGO_SELECT.USER.DEFAULT)
            .populate('tags', MONGO_SELECT.SPECIALITY.DEFAULT);
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

    async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
        console.log(updatePostDto);
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        let check = false;
        const authorPublished = await this.userModel.findById(userId);
        if (authorPublished.roles.includes('DOCTOR')) {
            for (let i = 0; i < post.tags.length; i++) {
                const speciality = await this.specialityModel.findById(post.tags[i]);
                if (authorPublished.doctorInfo.specialities[0]._id.toString() === speciality._id.toString()) {
                    post.publishedBy = new Types.ObjectId(userId);
                    check = true;
                    break;
                }
            }
        }
        if (!check) {
            throw new Error('Unauthorized');
        }
        else {
            post.status = updatePostDto.status;
            console.log(updatePostDto);

            if (updatePostDto.status === PostStatus.PUBLISHED) {
                console.log('published');
                this.notificationService.pushGeneralNotificationToQueue({
                    recipient: post.author,
                    content: 'Bài viết của bạn đã được duyệt.',
                    actionUrl: `/post/${postId}`,
                });
            } else if (updatePostDto.status === PostStatus.REJECTED) {
                console.log('rejected');
                post.reasonRejected = updatePostDto.reasonRejected;

                this.notificationService.pushGeneralNotificationToQueue({
                    recipient: post.author,
                    content: `Bài viết "${post.title}" của bạn đã bị từ chối với lí do: ${updatePostDto.reasonRejected}.`,
                });
            }
            await post.save();

            return post;
        }

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
