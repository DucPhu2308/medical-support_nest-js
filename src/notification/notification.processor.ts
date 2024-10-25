import { Process, Processor } from "@nestjs/bull";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { Job } from "bull";
import { GeneralNotificationDto } from "./dtos/general-notification.dto";

@Processor('notification')
export class NotificationProcessor {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway,
    ) {}

    @Process('general-notification')
    async generalNotification(job: Job) {
        const generalNotication: GeneralNotificationDto = job.data;
        const notification = await this.notificationService.createGeneralNotification(generalNotication);
        this.notificationGateway.sendNotificationToUser(notification.recipient.toHexString(), notification);
    }

    @Process('react-post-notification')
    async reactPostNotification(job: Job) {
        const { postId, userId } = job.data;
        const notification = await this.notificationService.createOrUpdateReactPostNotification(userId, postId);
        this.notificationGateway.sendNotificationToUser(notification.recipient.toHexString(), notification);
    }

    @Process('comment-post-notification')
    async commentPostNotification(job: Job) {
        const { postId, userId } = job.data;
        const notification = await this.notificationService.createOrUpdateCommentPostNotification(userId, postId);
        this.notificationGateway.sendNotificationToUser(notification.recipient.toHexString(), notification);
    }

    @Process('reply-comment-notification')
    async replyCommentNotification(job: Job) {
        const { parentComment, userId } = job.data;
        const notification = await this.notificationService.createOrUpdateReplyCommentNotification(userId, parentComment);
        this.notificationGateway.sendNotificationToUser(notification.recipient.toHexString(), notification);
    }

    @Process('appointment-reminder')
    async appointmentReminder(job: Job) {
        const { appointmentId } = job.data;
        const [notification1, notification2] = await this.notificationService.createAppointmentReminderNotification(appointmentId);
        this.notificationGateway.sendNotificationToUser(notification1.recipient.toHexString(), notification1);
        this.notificationGateway.sendNotificationToUser(notification2.recipient.toHexString(), notification2);
    }

}