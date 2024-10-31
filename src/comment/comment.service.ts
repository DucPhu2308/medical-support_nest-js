import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCommentPostDto } from "./dtos/create-comment-post.dto";
import { User } from "src/schemas/user.schema";
import { Comment } from "src/schemas/comment.schema";
import { Post } from "src/schemas/post.schema";
import { NotificationService } from "src/notification/notification.service";
import { FirebaseService, UploadFolder } from "src/firebase/firebase.service";



@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        private readonly notificationService: NotificationService,
        private readonly firebaseService: FirebaseService
    ) { }

    async createComment(createCommentDto: CreateCommentPostDto) {
        const currentUser = await this.userModel.findById(createCommentDto.userId);
        if (!currentUser) {
            throw new Error('User not found');
        }
    
        let parentComment = null;
        if (createCommentDto.parentCommentId) {
            parentComment = await this.commentModel.findById(createCommentDto.parentCommentId);
            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
        }
    
        const image = createCommentDto.imageContent 
            ? await this.firebaseService.uploadFile(createCommentDto.imageContent, UploadFolder.POST) 
            : null;
    
        const newComment = await this.commentModel.create({
            author: currentUser._id,
            content: createCommentDto.content,
            postId: new Types.ObjectId(createCommentDto.postId),
            replies: [],
            parentId: parentComment ? parentComment._id : null,
            image: image
        });
    
        if (parentComment) {
            parentComment.replies.push(newComment._id);
            if (parentComment.author.toHexString() !== currentUser._id.toHexString()) {
                this.notificationService.pushReplyCommentNotificationToQueue(currentUser._id.toHexString(), parentComment);
            }
            await parentComment.save();
        } else {
            const post = await this.postModel.findById(createCommentDto.postId);
            if (!post) {
                throw new Error('Post not found');
            }
            post.comments.push(newComment._id);
    
            if (post.author.toHexString() !== currentUser._id.toHexString()) {
                this.notificationService.pushCommentPostNotificationToQueue(currentUser._id.toHexString(), post._id.toHexString());
            }
    
            await post.save();
        }
    
        await newComment.populate('author');
        return newComment;
    }
    


    async findCommentsByPostId(postId: Types.ObjectId): Promise<any[]> {
        // Retrieve the post and its comments
        const post = await this.postModel.findById(postId).populate({
            path: 'comments',
            populate: {
                path: 'author', // Populate the author field with the full user object
                model: 'User'   // Specify the model name for the user
            }
        }).exec();

        if (!post) {
            throw new Error('Post not found');
        }

        // Fetch comments with populated authors
        const comments = await this.commentModel.find({ _id: { $in: post.comments } })
            .populate({
                path: 'author', // Populate the author field with the full user object
                model: 'User'   // Specify the model name for the user
            })
            .exec();

        // Function to populate replies recursively
        const populateReplies = async (comment: any) => {
            comment.replies = await this.commentModel.find({ _id: { $in: comment.replies } })
                .populate({
                    path: 'author', // Populate the author field with the full user object
                    model: 'User'   // Specify the model name for the user
                })
                .exec();

            // Recursively populate replies for each reply
            for (const reply of comment.replies) {
                await populateReplies(reply);
            }
        };

        // Populate replies for each comment
        for (const comment of comments) {
            await populateReplies(comment);
        }

        return comments;
    }

    async likeComment(commentId: string, userId: string) {
        const comment = await this.commentModel.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        const userObjectId = new Types.ObjectId(userId);

        // Check if the user has already liked the comment
        const likedIndex = comment.likedBy.findIndex(
            (id) => id.toString() === userObjectId.toString()
        );

        if (likedIndex === -1) {
            // User hasn't liked the comment yet, add the like
            comment.likedBy.push(userObjectId);
        } else {
            // User has already liked the comment, remove the like
            comment.likedBy.splice(likedIndex, 1);
        }

        return await comment.save();
    }

}