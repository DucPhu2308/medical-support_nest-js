import { Process, Processor } from "@nestjs/bull";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { Job } from "bull";

@Processor('notification')
export class NotificationProcessor {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway,
    ) {}

    @Process('react-post-notification')
    async reactPostNotification(job: Job) {
        const { postId, userId } = job.data;
        const notification = await this.notificationService.createOrUpdateReactPostNotification(userId, postId);
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