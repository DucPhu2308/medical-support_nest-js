import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { Appointment } from 'src/schemas/appointment.schema';
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
            // notification.content = `${user.lastName} ${totalSubjects > 1 ? `và ${totalSubject}` : ''} đã bày tỏ cảm xúc với bài viết của bạn`;
            let content = user.lastName;
            if (totalSubjects > 1) {
                content += ` và ${totalSubjects - 1} người khác`;
            }
            content += ' đã bày tỏ cảm xúc với bài viết của bạn';
            notification.content = content;
            return notification.save();
        } else {
            const newNoti = await this.notificationModel.create({
                content: `${user.lastName} đã bày tỏ cảm xúc với bài viết của bạn`,
                type: NotificationType.POST_REACT,
                recipient: post.author,
                actionUrl: `/post/${postId}`,
            });
            return newNoti;
        }
    }

    async pushReactPostNotificationToQueue(userId: string, postId: string) {
        await this.notificationQueue.add('react-post-notification', { userId, postId });
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
        });

        const notification2 = this.notificationModel.create({
            content: `${user1.lastName} có một cuộc hẹn vào lúc ${appointment.date.toLocaleTimeString()} ngày ${appointment.date.toLocaleDateString()} với bạn`,
            type: NotificationType.APPOINTMENT_REMINDER,
            recipient: appointment.recipient,
            actionUrl: `/appointment/${appointmentId}`,
        });

        return await Promise.all([notification1, notification2]);
    }
}
