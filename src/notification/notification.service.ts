import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { Appointment } from 'src/schemas/appointment.schema';
import { Comment } from 'src/schemas/comment.schema';
import { Notification, NotificationType } from 'src/schemas/notification.schema';
import { Post } from 'src/schemas/post.schema';
import { User } from 'src/schemas/user.schema';
import { GeneralNotificationDto } from './dtos/general-notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
        @InjectQueue('notification') private notificationQueue: Queue,
    ) {}

    async getNotifications(userId: string) {
        return this.notificationModel
            .find({ recipient: userId })
            .limit(10)
            .sort({ updatedAt: -1 });
    }
    
    async markAsRead(notificationId: string[], userId: string) {
        await this.notificationModel.updateMany({ _id: { $in: notificationId } }, { isRead: true });
        return this.getNotifications(userId);
    }

    async createGeneralNotification(generalNotication: GeneralNotificationDto) {
        return this.notificationModel.create({
            ...generalNotication,
            type: NotificationType.GENERAL,
        });
    }

    async pushGeneralNotificationToQueue(generalNotication: GeneralNotificationDto) {
        await this.notificationQueue.add('general-notification', generalNotication);
    }

    async createOrUpdateReactPostNotification(userId: string, postId: string) {
        const [post, user] = await Promise.all([
            this.postModel.findById(postId),
            this.userModel.findById(userId)
        ]);

        const notification = await this.notificationModel.findOne({
            directObject: postId,
            type: NotificationType.POST_REACT,
        }) || new this.notificationModel();
    
        const totalSubjects = post.likedBy.length + post.lovedBy.length + post.surprisedBy.length;
        const content = `${user.lastName}${totalSubjects > 1 ? ` và ${totalSubjects - 1} người khác` : ''} đã bày tỏ cảm xúc với bài viết của bạn`;
    
        notification.content = content;
        notification.imageUrl = user.avatar;
        notification.isRead = false;
        notification.directObject = postId;
        notification.type = NotificationType.POST_REACT;
        notification.recipient = post.author;
        notification.actionUrl = `/post/${postId}`;
        notification.updatedAt = new Date();
    
        return notification.save();
    }

    async createOrUpdateCommentPostNotification(userId: string, postId: string) {
        const [post, user] = await Promise.all([
            this.postModel.findById(postId),
            this.userModel.findById(userId)
        ]);

        const notification = await this.notificationModel.findOne({
            directObject: postId,
            type: NotificationType.POST_COMMENT,
        }) || new this.notificationModel();
    
        const content = `${user.lastName} đã bình luận về bài viết của bạn`;
    
        notification.content = content;
        notification.imageUrl = user.avatar;
        notification.isRead = false;
        notification.directObject = postId;
        notification.type = NotificationType.POST_COMMENT;
        notification.recipient = post.author;
        notification.actionUrl = `/post/${postId}`;
        notification.updatedAt = new Date();
    
        return notification.save();

    }

    async createOrUpdateReplyCommentNotification(userId: string, parentComment: Comment) {
        const user = await this.userModel.findById(userId);

        const notification = await this.notificationModel.findOne({
            directObject: parentComment._id,
            type: NotificationType.REPLY_COMMENT,
        }) || new this.notificationModel();
    
        const content = `${user.lastName} đã trả lời bình luận của bạn`;
    
        notification.content = content;
        notification.imageUrl = user.avatar;
        notification.isRead = false;
        notification.directObject = parentComment._id;
        notification.type = NotificationType.REPLY_COMMENT;
        notification.recipient = parentComment.author;
        notification.actionUrl = `/post/${parentComment.postId}`;
        notification.updatedAt = new Date();
    
        return notification.save();
    }

    async pushReactPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('react-post-notification', { userId, postId });
    }

    async pushCommentPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('comment-post-notification', { userId, postId });
    }

    async pushReplyCommentNotificationToQueue(userId: string, parentComment: Comment) {
        await this.notificationQueue.add('reply-comment-notification', { userId, parentComment });
    }

    async scheduleAppointmentReminder(appointmentId: string) {
        const appointment = await this.appointmentModel.findById(appointmentId);
        // 30 minutes before the appointment
        const reminderTime = new Date(appointment.date.getTime() - 30 * 60 * 1000);

        const job = await this.notificationQueue.add('appointment-reminder', { appointmentId }, {
            delay: reminderTime.getTime() - Date.now(),
            removeOnComplete: true,
        });

        appointment.reminderJobId = job.id.toString();
        appointment.save();
    }

    async cancelAppointmentReminder(appointmentId: string) {
        const appointment = await this.appointmentModel.findById(appointmentId);
        if (!appointment.reminderJobId) {
            return;
        }
        const job = await this.notificationQueue.getJob(appointment.reminderJobId);
        if (job) {
            await job.remove();
        }
    }

    async createAppointmentReminderNotification(appointmentId: string) {
        const appointment = await this.appointmentModel.findById(appointmentId);
        const user1 = await this.userModel.findById(appointment.sender);
        const user2 = await this.userModel.findById(appointment.recipient);

        const notification1 = this.notificationModel.create({
            content: `Bạn có một cuộc hẹn vào lúc ${appointment.date.toLocaleTimeString()} ngày ${appointment.date.toLocaleDateString()} với ${user2.lastName}`,
            type: NotificationType.APPOINTMENT_REMINDER,
            recipient: appointment.sender,
            actionUrl: `/appointment/${appointmentId}`,
            imageUrl: user2.avatar,
        });

        const notification2 = this.notificationModel.create({
            content: `${user1.lastName} có một cuộc hẹn vào lúc ${appointment.date.toLocaleTimeString()} ngày ${appointment.date.toLocaleDateString()} với bạn`,
            type: NotificationType.APPOINTMENT_REMINDER,
            recipient: appointment.recipient,
            actionUrl: `/appointment/${appointmentId}`,
            imageUrl: user1.avatar,
        });

        return await Promise.all([notification1, notification2]);
    }
}
