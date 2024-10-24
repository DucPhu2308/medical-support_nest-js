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
    
        return notification.save();

    }

    async createOrUpdateReplyCommentNotification(userId: string, comment: Comment) {
        const [post, user] = await Promise.all([
            this.postModel.findById(comment.postId),
            this.userModel.findById(userId),
        ]);

        const notification = await this.notificationModel.findOne({
            directObject: comment._id,
            type: NotificationType.REPLY_COMMENT,
        });

        if (notification) {
            // notification.subjects.push(userId);
            const totalSubjects = post.comments.length;
            // notification.content = `${user.lastName} ${totalSubjects > 1 ? `và ${totalSubject}` : ''} đã bày tỏ cảm xúc với bài viết của bạn`;
            let content = user.lastName;
            if (totalSubjects > 1) {
                content += ` và ${totalSubjects - 1} người khác`;
            }
            content += ' đã trả lời bình luận của bạn';
            notification.content = content;
            notification.imageUrl = user.avatar;
            notification.isRead = false;
            return notification.save();
        } else {
            const newNoti = await this.notificationModel.create({
                content: `${user.lastName} đã trả lời bình luận của bạn`,
                type: NotificationType.REPLY_COMMENT,
                recipient: post.author,
                actionUrl: `/post/${post._id}`,
                imageUrl: user.avatar,
            });
            return newNoti;
        }
    }

    async pushReactPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('react-post-notification', { userId, postId });
    }

    async pushCommentPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('comment-post-notification', { userId, postId });
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
