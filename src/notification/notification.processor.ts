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

}