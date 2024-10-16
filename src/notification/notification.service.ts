import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { Notification, NotificationType } from 'src/schemas/notification.schema';
import { Post } from 'src/schemas/post.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectQueue('notification') private notificationQueue: Queue,
    ) {}

    async getNotifications(userId: string) {
        return this.notificationModel.find({ recipient: userId }).sort({ updatedAt: -1 });
    }

    async createOrUpdateReactPostNotification(userId: string, postId: string) {
        const post = await this.postModel.findById(postId);
        const user = await this.userModel.findById(userId);

        const notification = await this.notificationModel.findOne({
            directObject: postId,
            type: NotificationType.POST_REACT,
        });
        

        if (notification) {
            // notification.subjects.push(userId);
            const totalSubjects = post.likedBy.length + post.lovedBy.length + post.surprisedBy.length;
            notification.content = `${user.lastName} và ${totalSubjects - 1} người khác đã bày tỏ cảm xúc với bài viết của bạn`;
            return notification.save();
        } else {
            const newNoti = await this.notificationModel.create({
                content: `${user.lastName} đã bày tỏ cảm xúc với bài viết của bạn`,
                type: NotificationType.POST_REACT,
                subjects: [userId],
                directObject: postId,
                recipient: post.author,
                actionUrl: `/post/${postId}`,
            });
            console.log(newNoti);
            return newNoti;
        }
    }

    async pushReactPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('react-post-notification', { userId, postId });
    }


}
