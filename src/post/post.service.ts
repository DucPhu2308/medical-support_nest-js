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
import { Comment } from 'src/schemas/comment.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
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

        if (filterDto.tagId) {
            query.tags = { $in: [new Types.ObjectId(filterDto.tagId)] };
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

        if (filterDto.createdAtFrom || filterDto.createdAtTo) {
            query.createdAt = {};
            if (filterDto.createdAtFrom) {
                query.createdAt.$gte = new Date(filterDto.createdAtFrom);
            }
            if (filterDto.createdAtTo) {
                query.createdAt.$lte = new Date(filterDto.createdAtTo);
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

    async getPostByMonthYear(month: number, year: number) {
        try {
            // Create a start and end date for the specified month
            const startDate = new Date(year, month - 1, 1); // Start of the month
            const endDate = new Date(year, month, 0); // End of the month (last day of the month)
    
            // Generate an array of all dates in the month
            const allDates = [];
            for (let day = 1; day <= endDate.getDate(); day++) {
                const date = new Date(year, month - 1, day);
                allDates.push(date.toISOString().split('T')[0]); // Convert to YYYY-MM-DD format
            }
    
            // Fetch post counts grouped by day within the given month
            const results = await this.postModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate, // Greater than or equal to the start date
                            $lte: endDate,   // Less than or equal to the end date
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Group by day
                        },
                        count: { $sum: 1 }, // Count the number of posts per day
                    },
                },
                {
                    $sort: { _id: 1 }, // Sort by date ascending
                },
            ]);
    
            // Map results to a dictionary with date as key
            const resultMap = results.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});
    
            // For each date in the month, return the count or 0 if no posts exist for that day
            const formattedResults = allDates.map(date => ({
                date,
                count: resultMap[date] || 0, // Use the count from the result or 0 if no posts
            }));
    
            return formattedResults;
        } catch (error) {
            console.error("Error in getPostStartByDay:", error);
            throw error;
        }
    }

    async getPostsByTag() {    
        // dữ liệu trả về sẽ là [{name: 'tag1', count: 5}, {name: 'tag2', count: 3}, ...]
        return await this.postModel.aggregate([
            {
                $unwind: "$tags" // giải nén mảng tags
            },
            {
                $lookup: {
                    from: "specialities", // collection cần join
                    localField: "tags", // field trong collection hiện tại
                    foreignField: "_id", // field trong collection join
                    as: "tag" // alias của collection join
                }
            },
            {
                $group: {
                    _id: "$tags", // group theo tag
                    count: { $sum: 1 }, // đếm số lượng post của mỗi tag
                    name: { $first: "$tag.name" } // lấy tên của tag
                }
            },
            {
                $project: {
                    _id: 0, // không hiển thị _id
                    name: 1, // hiển thị name
                    count: 1 // hiển thị count
                }
            }
        ]);

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

    async updateStatusPost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
        // kiểm tra user có quyền duyệt bài viết không
        const author = await this.userModel.findById(userId);
        if (author.doctorInfo.isPermission === false) {
            throw new Error('Unauthorized');
        }
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

        // Delete comments of the post
        await this.commentModel.deleteMany({ postId: new Types.ObjectId(postId) });

        await this.postModel.deleteOne({ _id: new Types.ObjectId(postId) });
        return 'Delete success';
    }
}
